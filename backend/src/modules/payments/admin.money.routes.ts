import { NextFunction, Response, Router } from "express";
import { z } from "zod";
import { authenticateToken, authorizeRole, AuthRequest } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import { UserRole } from "../../database/models/User";
import { AdminMoneyService } from "./admin.money.service";
import { AdminMoneyError, RefundService } from "./refund.service";

// /api/v1/admin/refunds and /api/v1/admin/payouts — admin only (bank details are shown).

const router = Router();
const service = new AdminMoneyService();
const refunds = new RefundService();
const adminOnly = [authenticateToken, authorizeRole([UserRole.ADMIN])];

const orderParam = z.object({ params: z.object({ orderId: z.string().min(1).max(64) }) });
const payoutParam = z.object({ kind: z.enum(["driver", "vendor"]), id: z.string().regex(/^[a-f0-9]{24}$/i) });
const reference = z.string().trim().min(3, "Enter the bank / UPI reference (UTR)").max(100);
const note = z.string().trim().max(500).optional();

const handle = (fn: (req: AuthRequest, res: Response) => Promise<unknown>) =>
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await fn(req, res);
    } catch (error) {
      if (error instanceof AdminMoneyError) return res.status(error.statusCode).json({ message: error.message });
      next(error);
    }
  };

// ---- Refunds -----------------------------------------------------------------------------------
router.get("/refunds", ...adminOnly, handle(async (_req, res) => {
  res.json(await service.listRefunds());
}));

router.post("/refunds/:orderId/refresh", ...adminOnly, validateRequest(orderParam), handle(async (req, res) => {
  res.json(await refunds.refreshRefund(String(req.params.orderId)));
}));

router.post("/refunds/:orderId/retry", ...adminOnly, validateRequest(orderParam), handle(async (req, res) => {
  res.json(await refunds.retryRefund(String(req.params.orderId)));
}));

router.post(
  "/refunds/:orderId/mark-refunded",
  ...adminOnly,
  validateRequest(orderParam.extend({ body: z.object({ reference, note }) })),
  handle(async (req, res) => {
    res.json(await refunds.markRefundedManually(String(req.params.orderId), req.user!.userId, req.body.reference, req.body.note));
  }),
);

// ---- Payouts -----------------------------------------------------------------------------------
router.get("/payouts", ...adminOnly, handle(async (_req, res) => {
  res.json(await service.listPayouts());
}));

router.post(
  "/payouts/:kind/:id/mark-paid",
  ...adminOnly,
  validateRequest(z.object({ params: payoutParam, body: z.object({ reference, note }) })),
  handle(async (req, res) => {
    const { kind, id } = req.params as { kind: "driver" | "vendor"; id: string };
    res.json(await service.markPayoutPaid(kind, id, req.user!.userId, req.body.reference, req.body.note));
  }),
);

router.post(
  "/payouts/:kind/:id/reject",
  ...adminOnly,
  validateRequest(z.object({ params: payoutParam, body: z.object({ reason: z.string().trim().min(3, "Enter a reason").max(300) }) })),
  handle(async (req, res) => {
    const { kind, id } = req.params as { kind: "driver" | "vendor"; id: string };
    res.json(await service.rejectPayout(kind, id, req.user!.userId, req.body.reason));
  }),
);

export default router;
