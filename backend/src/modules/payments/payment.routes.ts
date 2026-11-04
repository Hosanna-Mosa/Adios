import express, { NextFunction, Request, Response, Router } from "express";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import { PaymentService } from "./payment.service";
import { CheckoutService, PaymentError } from "./payment.checkout.service";
import { RefundService } from "./refund.service";
import { renderCheckoutPage, renderResultPage } from "./payment.checkout.page";
import { authenticateToken, AuthRequest } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import { checkoutStatusSchema, createRazorpayOrderSchema, createTopupSchema, verifyPaymentSchema } from "./payment.validation";

const router = Router();
const paymentService = new PaymentService();
const checkoutService = new CheckoutService();
const refundService = new RefundService();

// Plan §6.19: create-order 10/min, verify 20/min, status polling 60/min.
const limiter = (max: number) =>
  rateLimit({ windowMs: 60 * 1000, max, standardHeaders: true, legacyHeaders: false, message: { code: "RATE_LIMITED", message: "Too many requests" } });

const sendPaymentError = (res: Response, next: NextFunction, error: unknown) => {
  if (error instanceof PaymentError) {
    const changes = (error as any).changes;
    return res.status(error.statusCode).json({ code: error.code, message: error.message, ...(changes ? { changes } : {}) });
  }
  return next(error);
};

// The public URL the phone's browser can reach. Behind a proxy set PUBLIC_API_URL.
const publicBaseUrl = (req: Request) =>
  (process.env.PUBLIC_API_URL ||
    `${(req.headers["x-forwarded-proto"] as string)?.split(",")[0] || req.protocol}://${req.get("host")}`).replace(/\/+$/, "");

const withQuery = (url: string, params: Record<string, string | undefined>) => {
  const query = Object.entries(params)
    .filter(([, v]) => v)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v!)}`)
    .join("&");
  return query ? `${url}${url.includes("?") ? "&" : "?"}${query}` : url;
};

// Razorpay's checkout.js needs scripts and frames from its own domains, which the global
// helmet() CSP blocks. These two pages carry no user-controlled markup (all values escaped).
const allowRazorpayCheckout = (res: Response) => {
  res.removeHeader("Content-Security-Policy");
  res.removeHeader("Cross-Origin-Opener-Policy");
  res.removeHeader("Cross-Origin-Embedder-Policy");
  res.setHeader("Cache-Control", "no-store");
};

// 1. The app asks to pay. Creates a Payment bound to this user plus its Razorpay order.
router.post(
  "/create-order",
  authenticateToken,
  limiter(10),
  validateRequest(createRazorpayOrderSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await checkoutService.createCheckout({
        userId: req.user!.userId,
        amount: req.body.amount,
        orderData: req.body.orderData,
        returnUrl: req.body.returnUrl,
        language: req.body.language,
        baseUrl: publicBaseUrl(req),
      });
      res.json(result);
    } catch (error) {
      sendPaymentError(res, next, error);
    }
  },
);

// 1b. A helper task paid online raises its price: pay the difference. Settled by /verify like an order.
router.post(
  "/create-topup",
  authenticateToken,
  limiter(10),
  validateRequest(createTopupSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await checkoutService.createTopupCheckout({
        userId: req.user!.userId,
        orderId: req.body.orderId,
        amount: req.body.amount,
        returnUrl: req.body.returnUrl,
        language: req.body.language,
        baseUrl: publicBaseUrl(req),
      });
      res.json(result);
    } catch (error) {
      sendPaymentError(res, next, error);
    }
  },
);

// 2. The page the app opens in the browser. The signed `t` token stands in for the login.
router.get("/checkout/:paymentId", limiter(30), async (req: Request, res: Response, next: NextFunction) => {
  try {
    allowRazorpayCheckout(res);
    const found = await checkoutService.getPaymentForCheckoutToken(String(req.params.paymentId), String(req.query.t || ""));
    if (!found) {
      return res.status(410).type("html").send(renderResultPage({ outcome: "expired" }));
    }
    const { payment, user } = found;
    if (payment.status === "captured") {
      return res.type("html").send(
        renderResultPage({
          language: payment.language,
          outcome: "success",
          returnUrl: withQuery(payment.returnUrl!, { status: "success", razorpay_order_id: payment.razorpayOrderId }),
        }),
      );
    }

    const base = publicBaseUrl(req);
    res.type("html").send(
      renderCheckoutPage({
        language: payment.language,
        amountPaise: payment.amount,
        callbackUrl: `${base}/api/v1/payments/checkout/callback`,
        cancelUrl: withQuery(payment.returnUrl!, { status: "cancelled", razorpay_order_id: payment.razorpayOrderId }),
        checkoutOptions: {
          key: process.env.RAZORPAY_KEY_ID,
          order_id: payment.razorpayOrderId,
          amount: payment.amount,
          currency: payment.currency,
          name: "Flavour",
          prefill: { name: user?.name, email: user?.email, contact: user?.phone },
          theme: { color: "#0EA5E9" },
          timeout: 25 * 60, // a little shorter than the 30-minute link
        },
      }),
    );
  } catch (error) {
    next(error);
  }
});

// 3. Razorpay posts the result here (redirect mode), then we send the browser back to the app.
router.post(
  "/checkout/callback",
  limiter(30),
  express.urlencoded({ extended: true }),
  async (req: Request, res: Response) => {
    allowRazorpayCheckout(res);
    const body = req.body || {};
    const razorpayOrderId: string | undefined = body.razorpay_order_id || body.error?.metadata?.order_id;
    if (!razorpayOrderId || typeof razorpayOrderId !== "string") {
      return res.status(400).type("html").send(renderResultPage({ outcome: "failed" }));
    }

    const payment = await checkoutService.findByRazorpayOrderId(razorpayOrderId).catch(() => null);
    if (!payment) {
      return res.status(404).type("html").send(renderResultPage({ outcome: "failed" }));
    }

    const paymentId: string | undefined = body.razorpay_payment_id;
    const signature: string | undefined = body.razorpay_signature;
    const signatureOk =
      !!paymentId && !!signature && (await paymentService.verifyPayment(paymentId, razorpayOrderId, signature));

    if (!signatureOk) {
      if (paymentId || signature) console.error(`[checkout] ALERT invalid callback signature for ${razorpayOrderId}`);
      const reason = typeof body.error?.reason === "string" ? body.error.reason : undefined;
      return res.type("html").send(
        renderResultPage({
          language: payment.language,
          outcome: "failed",
          returnUrl: withQuery(payment.returnUrl!, { status: "failed", razorpay_order_id: razorpayOrderId, reason }),
        }),
      );
    }

    // Place the order now, so it exists even if the app never comes back. The app's verify
    // call afterwards simply finds it (settle is idempotent).
    try {
      await checkoutService.settle(payment, paymentId);
    } catch (error) {
      if (!(error instanceof PaymentError && error.code === "CONFIRMING")) {
        console.error(`[checkout] Callback settle failed for ${razorpayOrderId}:`, error);
      }
    }

    return res.type("html").send(
      renderResultPage({
        language: payment.language,
        outcome: "success",
        returnUrl: withQuery(payment.returnUrl!, {
          status: "success",
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        }),
      }),
    );
  },
);

// 4. Browser closed without coming back: has money arrived for this checkout?
router.get(
  "/checkout-status/:razorpayOrderId",
  authenticateToken,
  limiter(60),
  validateRequest(checkoutStatusSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.json(await checkoutService.getCheckoutStatus(req.user!.userId, String(req.params.razorpayOrderId)));
    } catch (error) {
      sendPaymentError(res, next, error);
    }
  },
);

// 5. The app confirms. Ownership first, then the settle procedure (which fetches from Razorpay).
router.post(
  "/verify",
  authenticateToken,
  limiter(20),
  validateRequest(verifyPaymentSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

      if (razorpay_payment_id && !(await paymentService.verifyPayment(razorpay_payment_id, razorpay_order_id, razorpay_signature))) {
        console.error(`[checkout] ALERT invalid verify signature for ${razorpay_order_id}`);
        return res.status(400).json({ code: "INVALID_SIGNATURE", message: "Payment verification failed" });
      }

      const payment = await checkoutService.findByRazorpayOrderId(razorpay_order_id);
      if (!payment || payment.user.toString() !== req.user!.userId) {
        return res.status(404).json({ code: "NOT_FOUND", message: "Payment not found" });
      }

      const { order } = await checkoutService.settle(payment, razorpay_payment_id);
      return res.json({ code: "SETTLED", message: "Payment verified and order created", order });
    } catch (error) {
      sendPaymentError(res, next, error);
    }
  },
);

// 6. Razorpay webhook (safety net, §6.6.1). Needs the raw body — mounted before express.json in index.ts.
router.post("/webhook", async (req: Request, res: Response) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return res.status(503).json({ code: "FEATURE_DISABLED" });

  const raw: Buffer | undefined = Buffer.isBuffer(req.body) ? req.body : undefined;
  const signature = req.headers["x-razorpay-signature"];
  if (!raw || typeof signature !== "string") return res.status(400).json({ code: "INVALID_REQUEST" });

  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    console.error("[checkout] ALERT webhook signature mismatch");
    return res.status(401).json({ code: "INVALID_SIGNATURE" });
  }

  try {
    const event = JSON.parse(raw.toString("utf8"));
    if (typeof event?.event === "string" && event.event.startsWith("refund.")) {
      await refundService.handleRefundEvent(event);
    } else {
      await checkoutService.handleWebhookEvent(event);
    }
    return res.json({ ok: true });
  } catch (error) {
    // A non-2xx makes Razorpay retry, and settle is idempotent.
    console.error("[checkout] Webhook processing failed:", error);
    return res.status(500).json({ ok: false });
  }
});

export default router;
