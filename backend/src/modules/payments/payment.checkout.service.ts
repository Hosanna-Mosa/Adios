import jwt from "jsonwebtoken";
import Payment, { IPayment, PaymentStatus } from "../../database/models/Payment";
import User from "../../database/models/User";
import Order, { ServiceType } from "../../database/models/Order";
import { OrdersService } from "../orders/orders.service";
import { razorpayClient } from "./payment.service";
import { getJwtSecret } from "../../utils/jwtSecret";
import { AppError } from "../../utils/errors";
import { OnlinePriceService } from "./payment.pricing";

// Pay-at-checkout through a Razorpay page opened in the phone's browser (Chrome Custom Tab).
// Security rules follow RAZORPAY_INTEGRATION.md §2: the Payment is bound to the user, the
// app's word is never trusted (every payment is fetched from Razorpay), and one Payment can
// place exactly one order no matter how many of app / callback / webhook report it.

const LEASE_MS = 2 * 60 * 1000;
const CHECKOUT_TOKEN_TTL = "30m";
const MIN_AMOUNT_PAISE = 100;

/** Stable, machine-readable failure. The app translates `code` (§6.18). */
export class PaymentError extends AppError {
  constructor(statusCode: number, public readonly code: string, message: string) {
    super(statusCode, message);
  }
}

// Only our own app may be sent back to. Expo Go / dev-client URLs are allowed outside production.
const isAllowedReturnUrl = (url: string) => {
  if (/^flavour:\/\//i.test(url)) return true;
  if (process.env.NODE_ENV === "production") return false;
  return /^(exp|exps|exp\+[a-z0-9-]+):\/\//i.test(url);
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class CheckoutService {
  private ordersService = new OrdersService();

  async createCheckout(input: {
    userId: string;
    amount: number; // rupees, as shown on the checkout screen
    orderData?: any;
    returnUrl?: string;
    language?: string;
    baseUrl: string;
  }) {
    // The server decides the amount (plan §2 principle 1). input.amount is only what the app
    // displayed; it is compared for logging and never charged.
    const quote = await new OnlinePriceService().quote(input.orderData);
    const amountPaise = Math.round(quote.amount * 100);
    if (Math.abs(quote.amount - Number(input.amount)) >= 0.01) {
      console.warn(`[checkout] App showed ₹${input.amount}, server price is ₹${quote.amount} (user ${input.userId}); charging the server price`);
    }
    if (amountPaise < MIN_AMOUNT_PAISE) {
      throw new PaymentError(400, "AMOUNT_TOO_LOW", "Amount must be at least ₹1");
    }
    const returnUrl = input.returnUrl && isAllowedReturnUrl(input.returnUrl) ? input.returnUrl : "flavour://payment-result";

    const user = await User.findById(input.userId).select("name email phone").lean();
    if (!user) throw new PaymentError(404, "NOT_FOUND", "User not found");

    let rzpOrder: any;
    try {
      rzpOrder = await razorpayClient.orders.create({
        amount: amountPaise,
        currency: "INR",
        receipt: `u_${input.userId}_${Date.now()}`.slice(0, 40),
        notes: { userId: input.userId, purpose: "order" },
      });
    } catch (error) {
      console.error("[checkout] Razorpay order creation failed:", error);
      throw new PaymentError(502, "RAZORPAY_UNAVAILABLE", "Could not start the payment. Please try again.");
    }

    const payment = await Payment.create({
      user: input.userId,
      amount: amountPaise,
      currency: "INR",
      razorpayOrderId: rzpOrder.id,
      orderData: quote.orderData,
      returnUrl,
      language: input.language,
    });

    const token = jwt.sign({ pid: payment._id.toString(), purpose: "rzp_checkout" }, getJwtSecret(), {
      expiresIn: CHECKOUT_TOKEN_TTL,
    });

    return {
      id: rzpOrder.id,
      amount: amountPaise,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
      name: "Flavour",
      prefill: { name: user.name, email: user.email, contact: user.phone },
      checkoutUrl: `${input.baseUrl}/api/v1/payments/checkout/${payment._id}?t=${encodeURIComponent(token)}`,
      returnUrl,
    };
  }

  /** Resolves the signed link the browser opens. Never trusts the payment id on its own. */
  async getPaymentForCheckoutToken(paymentId: string, token: string) {
    let payload: any;
    try {
      payload = jwt.verify(token, getJwtSecret());
    } catch {
      return null;
    }
    if (payload?.purpose !== "rzp_checkout" || payload.pid !== paymentId) return null;
    const payment = await Payment.findById(paymentId);
    if (!payment) return null;
    const user = await User.findById(payment.user).select("name email phone").lean();
    return { payment, user };
  }

  async findByRazorpayOrderId(razorpayOrderId: string) {
    return Payment.findOne({ razorpayOrderId });
  }

  /** Read-only: has money arrived for this checkout? Used when the browser is closed without a redirect. */
  async getCheckoutStatus(userId: string, razorpayOrderId: string) {
    const payment = await Payment.findOne({ razorpayOrderId, user: userId });
    if (!payment) throw new PaymentError(404, "NOT_FOUND", "Payment not found");
    if (payment.status === PaymentStatus.CAPTURED) return { state: "paid", orderId: payment.order };

    const result: any = await razorpayClient.orders.fetchPayments(razorpayOrderId);
    const items: any[] = result?.items || [];
    if (items.some((p) => p.status === "captured")) return { state: "paid" };
    if (items.some((p) => p.status === "authorized")) return { state: "confirming" };
    return { state: "unpaid" };
  }

  /**
   * The single settlement path (a reduced §6.5 procedure `S`). Fetches the payment from
   * Razorpay, checks it against the saved Payment, then places the order exactly once.
   * Safe to call any number of times, from any entry point.
   */
  async settle(payment: IPayment, razorpayPaymentId?: string) {
    if (payment.status === PaymentStatus.CAPTURED && payment.order) {
      return { payment, order: await this.loadOrder(payment) };
    }
    if (payment.status === PaymentStatus.FLAGGED) {
      throw new PaymentError(400, "INVALID_PAYMENT", "This payment could not be accepted");
    }

    const rzpPayment = await this.fetchCapturedPayment(payment, razorpayPaymentId);

    // A payment from a different Razorpay order is an attack signature: reject it, touch nothing (§6.5.1 step 5).
    if (rzpPayment.order_id !== payment.razorpayOrderId) {
      console.error(`[checkout] ALERT payment ${rzpPayment.id} does not belong to Razorpay order ${payment.razorpayOrderId}`);
      throw new PaymentError(400, "INVALID_PAYMENT", "This payment could not be accepted");
    }

    // Rule M (§6.5.3): Razorpay's amount, currency and order must match what this Payment was created for.
    if (
      Number(rzpPayment.amount) !== payment.amount ||
      rzpPayment.currency !== payment.currency
    ) {
      await Payment.updateOne(
        { _id: payment._id, status: { $in: [PaymentStatus.CREATED, PaymentStatus.PROCESSING] } },
        { status: PaymentStatus.FLAGGED, flagReason: "amount_currency_or_order_mismatch", razorpayPaymentId: rzpPayment.id },
      );
      console.error(`[checkout] ALERT mismatch on payment ${payment._id}: razorpay ${rzpPayment.id}`);
      throw new PaymentError(400, "INVALID_PAYMENT", "This payment could not be accepted");
    }

    // Take the lease, so only one run places the order.
    const now = new Date();
    const leased = await Payment.findOneAndUpdate(
      {
        _id: payment._id,
        order: { $exists: false },
        $or: [
          { status: PaymentStatus.CREATED },
          { status: PaymentStatus.PROCESSING, lockExpiresAt: { $lt: now } },
        ],
      },
      { status: PaymentStatus.PROCESSING, lockExpiresAt: new Date(now.getTime() + LEASE_MS), razorpayPaymentId: rzpPayment.id },
      { new: true },
    );

    if (!leased) {
      const current = await Payment.findById(payment._id);
      if (current?.status === PaymentStatus.CAPTURED && current.order) {
        return { payment: current, order: await this.loadOrder(current) };
      }
      throw new PaymentError(409, "CONFIRMING", "Your payment is being confirmed");
    }

    // Only the server-priced order data stored at checkout is used — never data sent later.
    const orderData = leased.orderData;
    if (!orderData?.stops?.length) {
      await Payment.updateOne({ _id: leased._id }, { status: PaymentStatus.CREATED, $unset: { lockExpiresAt: 1 }, lastError: "missing_order_data" });
      console.error(`[checkout] ALERT captured payment ${rzpPayment.id} has no order data — needs a manual refund`);
      throw new PaymentError(400, "ORDER_DATA_MISSING", "Payment received but the order details are missing");
    }

    // Recovery: an earlier run may have placed the order and then stopped before marking the
    // Payment captured. Orders carry `payment`, so reuse that order instead of placing a second one.
    let order: any = await Order.findOne({ payment: leased._id }).sort({ createdAt: 1 });
    if (!order) {
      try {
        // Same fields POST /orders takes (orders.controller create), so every service — food, meat,
        // store, package, rides and helpers — is placed exactly as a cash order would be, plus paid.
        const {
          stops, serviceType, vendorId, totals, radius, duration, isReserved, reservedAt,
          customerPrice, bookingFor, scheduledDelivery, scheduledFor, couponCode,
        } = orderData;
        const effectiveServiceType = Object.values(ServiceType).includes(serviceType) ? serviceType : ServiceType.DELIVERY;
        order = await this.ordersService.createOrder(
          leased.user.toString(),
          stops,
          effectiveServiceType,
          vendorId,
          totals,
          radius,
          duration,
          !!isReserved,
          isReserved ? reservedAt : undefined,
          {
            customerPrice,
            bookingFor,
            couponCode,
            // The money is already taken, so a slot that lapsed while paying must not throw:
            // send it as scheduledDelivery, which createOrder places immediately instead.
            scheduledDelivery: scheduledDelivery ?? (scheduledFor ? { type: "later", requestedAt: scheduledFor } : undefined),
            paymentMethod: "online",
            paymentStatus: "paid",
            paymentId: leased._id,
          },
        );
      } catch (error: any) {
        // Release the lease so a retry (app, callback or webhook) can place it again.
        await Payment.updateOne(
          { _id: leased._id, status: PaymentStatus.PROCESSING },
          { status: PaymentStatus.CREATED, $unset: { lockExpiresAt: 1 }, lastError: String(error?.message || error).slice(0, 500) },
        );
        console.error(`[checkout] ALERT order placement failed after capture ${rzpPayment.id}:`, error);
        throw error;
      }
    }

    const orderTotalPaise = Math.round(Number(order?.totalPrice || 0) * 100);
    if (orderTotalPaise !== leased.amount) {
      // Server pricing (plan P1) will remove this gap; until then make it visible.
      console.warn(`[checkout] Order ${order._id} total ${orderTotalPaise} paise ≠ paid ${leased.amount} paise (payment ${leased._id})`);
    }

    // The order exists and is paid from here on; failing to record that on the Payment must not
    // fail the customer's request. A later settle finds the order through `payment` above.
    let captured: IPayment | null = null;
    try {
      captured = await Payment.findOneAndUpdate(
        { _id: leased._id, status: PaymentStatus.PROCESSING },
        { status: PaymentStatus.CAPTURED, order: String(order._id), paidAt: new Date(), $unset: { lockExpiresAt: 1, lastError: 1 } },
        { new: true },
      );
    } catch (error) {
      console.error(`[checkout] ALERT could not mark payment ${leased._id} captured for order ${order._id}:`, error);
    }
    return { payment: captured ?? leased, order };
  }

  /** Webhook entry (§6.6.1): the payload is only a hint; `settle` fetches the truth. */
  async handleWebhookEvent(event: any) {
    const type = event?.event;
    if (type !== "payment.captured" && type !== "order.paid") return;
    const entity = event?.payload?.payment?.entity;
    const razorpayOrderId = entity?.order_id || event?.payload?.order?.entity?.id;
    if (!razorpayOrderId) return;

    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      console.warn(`[checkout] Webhook for unknown Razorpay order ${razorpayOrderId}`);
      return;
    }
    try {
      await this.settle(payment, entity?.id);
    } catch (error: any) {
      if (error instanceof PaymentError && error.code === "CONFIRMING") return;
      throw error;
    }
  }

  private async fetchCapturedPayment(payment: IPayment, razorpayPaymentId?: string) {
    // A captured payment is normally reported within seconds of authorization (auto-capture).
    let candidates: any[] = [];
    for (let attempt = 0; attempt < 4; attempt++) {
      if (attempt > 0) await sleep(1500);
      candidates = razorpayPaymentId
        ? [await razorpayClient.payments.fetch(razorpayPaymentId)]
        : ((await razorpayClient.orders.fetchPayments(payment.razorpayOrderId)) as any)?.items || [];

      const captured = candidates.find((p) => p.status === "captured");
      if (captured) return captured;
      if (!candidates.some((p) => p.status === "authorized" || p.status === "created")) break;
    }

    if (candidates.some((p) => p.status === "authorized")) {
      throw new PaymentError(409, "CONFIRMING", "Your payment is being confirmed");
    }
    throw new PaymentError(400, "PAYMENT_NOT_COMPLETED", "The payment was not completed");
  }

  private async loadOrder(payment: IPayment) {
    return Order.findById(payment.order);
  }
}
