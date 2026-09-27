import Order from "../../database/models/Order";
import Payment from "../../database/models/Payment";
import { NotificationService } from "../../services/notification.service";
import { razorpayClient } from "./payment.service";

// Real Razorpay refunds for cancelled orders that were paid online.
//
// refundStatus: not_requested → pending (claimed, Razorpay called) → processed | failed.
// "processed" and "failed" are only ever set from Razorpay's own answer: the refund API
// response, the refund webhook, or a fetch. A local update alone never marks money returned.
// Cash orders are never sent to Razorpay (there is no Razorpay payment to refund).

export type RefundOutcome =
  | { status: "not_applicable"; reason: string }
  | { status: "already_requested"; refundStatus: string }
  | { status: "pending" | "processed" | "failed"; razorpayRefundId?: string; reason?: string };

const mapRazorpayRefundStatus = (status: string): "pending" | "processed" | "failed" =>
  status === "processed" ? "processed" : status === "failed" ? "failed" : "pending";

export class RefundService {
  /** Called once an order is CANCELLED. Safe to call repeatedly: only the first call refunds. */
  async refundCancelledOrder(orderId: string, reason: string): Promise<RefundOutcome> {
    const order = await Order.findOne({ _id: orderId }).lean();
    if (!order) return { status: "not_applicable", reason: "order_not_found" };
    if (order.paymentMethod !== "online" || order.paymentStatus !== "paid" || !order.payment) {
      // Cash or unpaid orders: no Razorpay payment exists, so Razorpay is never called.
      return { status: "not_applicable", reason: "not_paid_online" };
    }

    const payment = await Payment.findById(order.payment).lean();
    if (!payment?.razorpayPaymentId) {
      console.error(`[refunds] ALERT order ${orderId} is paid online but has no Razorpay payment id`);
      return { status: "not_applicable", reason: "no_razorpay_payment" };
    }
    const amountPaise = payment.amount;

    // The claim: exactly one caller moves not_requested → pending and goes on to call Razorpay.
    const claimed = await Order.findOneAndUpdate(
      {
        _id: orderId,
        paymentMethod: "online",
        paymentStatus: "paid",
        $or: [{ refundStatus: "not_requested" }, { refundStatus: { $exists: false } }],
      },
      {
        $set: {
          refundStatus: "pending",
          refundAmount: amountPaise / 100,
          refundRequestedAt: new Date(),
        },
        $unset: { refundFailureReason: 1 },
      },
      { new: true },
    );
    if (!claimed) {
      const current = await Order.findOne({ _id: orderId }).select("refundStatus").lean();
      return { status: "already_requested", refundStatus: current?.refundStatus || "unknown" };
    }

    try {
      const refund: any = await razorpayClient.payments.refund(payment.razorpayPaymentId, {
        amount: amountPaise,
        receipt: `rf_${orderId}`.slice(0, 40),
        notes: { orderId: String(orderId), reason: reason.slice(0, 200) },
      } as any);

      const status = mapRazorpayRefundStatus(refund?.status);
      await Order.updateOne(
        { _id: orderId, refundStatus: "pending" },
        {
          $set: {
            razorpayRefundId: refund.id,
            refundStatus: status,
            ...(status === "processed" ? { refundCompletedAt: new Date() } : {}),
            ...(status === "failed" ? { refundFailureReason: "Razorpay reported the refund as failed" } : {}),
          },
        },
      );
      if (status === "failed") console.error(`[refunds] ALERT refund ${refund.id} for order ${orderId} failed`);
      return { status, razorpayRefundId: refund.id };
    } catch (error: any) {
      const statusCode = error?.statusCode ?? error?.error?.statusCode;
      const description = error?.error?.description || error?.message || "Razorpay refund request failed";
      const definitive = typeof statusCode === "number" && statusCode >= 400 && statusCode < 500;

      if (definitive) {
        // Razorpay rejected it, so no refund exists. Recorded for an admin to retry.
        await Order.updateOne(
          { _id: orderId, refundStatus: "pending" },
          { $set: { refundStatus: "failed", refundFailureReason: description } },
        );
        console.error(`[refunds] ALERT refund for order ${orderId} rejected by Razorpay: ${description}`);
        return { status: "failed", reason: description };
      }

      // Timeout / network / 5xx: Razorpay may have created it. Stay "pending" (never re-call
      // blindly — that could refund twice); the refund webhook correlates by notes.orderId.
      await Order.updateOne(
        { _id: orderId, refundStatus: "pending" },
        { $set: { refundFailureReason: `Awaiting Razorpay confirmation: ${description}` } },
      );
      console.error(`[refunds] ALERT refund for order ${orderId} outcome unknown: ${description}`);
      return { status: "pending", reason: description };
    }
  }

  /**
   * Refund webhook events (refund.processed / refund.failed / refund.created). The event only
   * says which refund; its state is fetched from Razorpay before anything changes.
   */
  async handleRefundEvent(event: any) {
    const entity = event?.payload?.refund?.entity;
    if (!entity?.id || !entity?.payment_id) return;

    const order =
      (await Order.findOne({ razorpayRefundId: entity.id })) ||
      (entity.notes?.orderId ? await Order.findOne({ _id: entity.notes.orderId }) : null);
    if (!order) {
      console.warn(`[refunds] ALERT refund ${entity.id} matches no order (refund made outside the app?)`);
      return;
    }

    const refund: any = await razorpayClient.payments.fetchRefund(entity.payment_id, entity.id);
    await this.applyRazorpayRefund(order._id.toString(), refund);
  }

  /**
   * Moves an order's refund to the state of a refund Razorpay returned. Only forward from
   * not_requested / pending / failed; a processed refund is final, so replays change nothing.
   */
  private async applyRazorpayRefund(orderId: string, refund: any) {
    const status = mapRazorpayRefundStatus(refund?.status);
    const updated = await Order.findOneAndUpdate(
      { _id: orderId, refundStatus: { $in: ["pending", "failed", "not_requested"] } },
      {
        $set: {
          razorpayRefundId: refund.id,
          refundStatus: status,
          refundMethod: "razorpay",
          refundAmount: Number(refund.amount) / 100,
          ...(status === "processed" ? { refundCompletedAt: new Date() } : {}),
          ...(status === "failed" ? { refundFailureReason: "Razorpay reported the refund as failed" } : {}),
        },
      },
      { new: true },
    );
    if (!updated) return null;

    if (status === "processed") {
      this.notifyRefunded(updated, "your original payment method").catch((err) =>
        console.error("[refunds] Failed to send refund notification:", err),
      );
    } else if (status === "failed") {
      console.error(`[refunds] ALERT refund ${refund.id} for order ${orderId} failed at Razorpay`);
    }
    return updated;
  }

  private async notifyRefunded(order: any, destination: string) {
    await NotificationService.getInstance().sendNotification({
      userId: order.user.toString(),
      title: "Refund processed 💸",
      body: `₹${order.refundAmount} for your cancelled order has been refunded to ${destination}. It can take 5–7 working days to show in your account.`,
      type: "transactional",
      category: "order_status",
      data: { orderId: order._id, deepLink: { screen: "/(tabs)/orders" } },
    });
  }

  // ---- Admin actions (admin panel → Refunds) -------------------------------------------------

  /**
   * Re-reads a pending refund from Razorpay (the webhook may be missing or late). A refund
   * whose id we never received (the call timed out) is looked up among the payment's refunds
   * by our order id; if Razorpay has none after 10 minutes, it is recorded as failed so it can
   * be retried safely.
   */
  async refreshRefund(orderId: string) {
    const order: any = await Order.findOne({ _id: orderId }).lean();
    if (!order || order.refundStatus !== "pending") return order;
    const payment = order.payment ? await Payment.findById(order.payment).lean() : null;
    if (!payment?.razorpayPaymentId) return order;

    if (order.razorpayRefundId) {
      const refund: any = await razorpayClient.payments.fetchRefund(payment.razorpayPaymentId, order.razorpayRefundId);
      await this.applyRazorpayRefund(orderId, refund);
    } else {
      const list: any = await razorpayClient.payments.fetchMultipleRefund(payment.razorpayPaymentId, { count: 100 } as any);
      const ours = (list?.items || []).find(
        (r: any) => r?.notes?.orderId === String(orderId) || r?.receipt === `rf_${orderId}`.slice(0, 40),
      );
      if (ours) {
        await this.applyRazorpayRefund(orderId, ours);
      } else if (order.refundRequestedAt && Date.now() - new Date(order.refundRequestedAt).getTime() > 10 * 60_000) {
        await Order.updateOne(
          { _id: orderId, refundStatus: "pending", razorpayRefundId: { $exists: false } },
          { $set: { refundStatus: "failed", refundFailureReason: "Razorpay has no refund for this order" } },
        );
      }
    }
    return Order.findOne({ _id: orderId }).lean();
  }

  /** Tries the Razorpay refund again. Only for a refund that failed or was never started. */
  async retryRefund(orderId: string) {
    const reset = await Order.findOneAndUpdate(
      { _id: orderId, paymentMethod: "online", paymentStatus: "paid", refundStatus: "failed" },
      { $set: { refundStatus: "not_requested" }, $unset: { razorpayRefundId: 1 } },
    );
    const current: any = reset ?? (await Order.findOne({ _id: orderId }).select("refundStatus status").lean());
    if (!current) throw new AdminMoneyError(404, "Order not found");
    if (!reset && current.refundStatus !== "not_requested") {
      throw new AdminMoneyError(409, `This refund is ${current.refundStatus}; it can't be retried.`);
    }
    return this.refundCancelledOrder(orderId, "admin_retry");
  }

  /**
   * An admin refunded the customer outside Razorpay (bank transfer / UPI) and records it.
   * Refused while a Razorpay refund exists or may exist, so the customer is never paid twice.
   */
  async markRefundedManually(orderId: string, adminUserId: string, reference: string, note?: string) {
    const order: any = await Order.findOne({ _id: orderId }).lean();
    if (!order) throw new AdminMoneyError(404, "Order not found");
    if (order.paymentMethod !== "online" || order.paymentStatus !== "paid") {
      throw new AdminMoneyError(409, "Only orders paid online can be refunded here.");
    }
    const updated = await Order.findOneAndUpdate(
      { _id: orderId, refundStatus: { $in: ["failed", "not_requested"] } },
      {
        $set: {
          refundStatus: "processed",
          refundMethod: "manual",
          refundReference: reference,
          refundedBy: adminUserId,
          refundAmount: order.refundAmount ?? order.totalPrice,
          refundCompletedAt: new Date(),
          ...(note ? { refundNote: note } : {}),
        },
      },
      { new: true },
    );
    if (!updated) {
      throw new AdminMoneyError(
        409,
        order.refundStatus === "pending"
          ? "A Razorpay refund is in progress for this order. Refresh its status first."
          : "This order is already refunded.",
      );
    }
    console.log(`[refunds] Order ${orderId} refunded manually by ${adminUserId} (ref ${reference})`);
    this.notifyRefunded(updated, `your account (reference ${reference})`).catch((err) =>
      console.error("[refunds] Failed to send refund notification:", err),
    );
    return updated;
  }
}

export class AdminMoneyError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
  }
}
