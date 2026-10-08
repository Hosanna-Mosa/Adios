import Order, { OrderStatus } from "../../database/models/Order";
import DriverPayout from "../../database/models/DriverPayout";
import VendorPayout from "../../database/models/VendorPayout";
import { AdminMoneyError, RefundService } from "./refund.service";
import { notifyPayoutOwner } from "./payout.status";

// Admin panel → Refunds and Payouts. Until RazorpayX is set up, driver and vendor payouts are
// paid by hand: the admin transfers the money and records the bank/UPI reference here.
// Refunds stay automatic through Razorpay; this page shows them and handles the exceptions.

type PayoutKind = "driver" | "vendor";
const payoutModels = { driver: DriverPayout, vendor: VendorPayout } as const;

const refundService = new RefundService();

export class AdminMoneyService {
  /**
   * Every online-paid order with a refund, plus cancelled online-paid orders whose refund never
   * started ("due"). Pending Razorpay refunds are re-read first, since the webhook may be missing.
   */
  async listRefunds() {
    const pending = await Order.find({ paymentMethod: "online", paymentStatus: "paid", refundStatus: "pending" })
      .select("_id")
      .limit(10)
      .lean();
    for (const o of pending) {
      await refundService.refreshRefund(String(o._id)).catch((err) =>
        console.warn(`[admin-money] Could not refresh refund for ${o._id}:`, err?.message),
      );
    }

    const orders = await Order.find({
      paymentMethod: "online",
      paymentStatus: "paid",
      $or: [
        { refundStatus: { $in: ["pending", "processed", "failed"] } },
        { status: OrderStatus.CANCELLED, refundStatus: { $in: ["not_requested", null] } },
      ],
    })
      .populate("user", "name phone")
      .populate("refundedBy", "name")
      .sort({ updatedAt: -1 })
      .limit(500)
      .lean();

    return orders.map((o: any) => ({
      orderId: String(o._id),
      serviceType: o.serviceType,
      // So the admin can label the row: a package delivery is stored as a bike/auto ride,
      // and a food order is a "delivery" with an outlet.
      packageDelivery: !!o.packageDelivery,
      vendor: !!o.vendor,
      customerName: o.user?.name || "Customer",
      customerPhone: o.user?.phone || "",
      amount: o.refundAmount ?? o.totalPrice,
      status: !o.refundStatus || o.refundStatus === "not_requested" ? "due" : o.refundStatus,
      method: o.refundMethod || (o.razorpayRefundId ? "razorpay" : undefined),
      razorpayRefundId: o.razorpayRefundId,
      reference: o.refundReference,
      refundedBy: o.refundedBy?.name,
      failureReason: o.refundFailureReason,
      requestedAt: o.refundRequestedAt,
      completedAt: o.refundCompletedAt,
      cancelledAt: o.updatedAt,
    }));
  }

  /** Payout requests from drivers and vendors, with the bank details needed to pay them. */
  async listPayouts() {
    const [drivers, vendors] = await Promise.all([
      DriverPayout.find({})
        .populate("user", "name phone")
        .populate("driver", "bankAccountNumber bankIfsc bankVerified")
        .populate("handledBy", "name")
        .sort({ createdAt: -1 })
        .limit(500)
        .lean(),
      VendorPayout.find({})
        .populate("vendor", "name phone legal")
        .populate("handledBy", "name")
        .sort({ createdAt: -1 })
        .limit(500)
        .lean(),
    ]);

    const rows = [
      ...drivers.map((p: any) => ({
        id: String(p._id),
        kind: "driver" as PayoutKind,
        name: p.user?.name || "Driver",
        phone: p.user?.phone || "",
        amount: p.amount,
        status: p.status,
        method: p.method || (p.razorpayPayoutId ? "razorpayx" : undefined),
        bank: {
          holderName: p.user?.name || "",
          accountNumber: p.driver?.bankAccountNumber || "",
          ifsc: p.driver?.bankIfsc || "",
          verified: !!p.driver?.bankVerified,
        },
        reference: p.utr,
        failureReason: p.failureReason,
        adminNote: p.adminNote,
        handledBy: p.handledBy?.name,
        requestedAt: p.createdAt,
        processedAt: p.processedAt,
      })),
      ...vendors.map((p: any) => ({
        id: String(p._id),
        kind: "vendor" as PayoutKind,
        name: p.vendor?.name || "Vendor",
        phone: p.vendor?.phone || "",
        amount: p.amount,
        status: p.status,
        method: p.method || (p.razorpayPayoutId ? "razorpayx" : undefined),
        bank: {
          holderName: p.vendor?.name || "",
          accountNumber: p.vendor?.legal?.bankAccount || "",
          ifsc: p.vendor?.legal?.ifsc || "",
          verified: !!p.vendor?.legal?.ifscVerified,
        },
        reference: p.utr,
        failureReason: p.failureReason,
        adminNote: p.adminNote,
        handledBy: p.handledBy?.name,
        requestedAt: p.createdAt,
        processedAt: p.processedAt,
      })),
    ];
    return rows.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }

  /**
   * The admin transferred the money by hand. Only a "requested" (pending) payout can be marked
   * paid: one already with RazorpayX (processing) is settled by RazorpayX, never twice.
   */
  async markPayoutPaid(kind: PayoutKind, id: string, adminUserId: string, reference: string, note?: string) {
    const Model: any = payoutModels[kind];
    const updated = await Model.findOneAndUpdate(
      { _id: id, status: "pending" },
      {
        $set: {
          status: "processed",
          method: "manual",
          utr: reference,
          processedAt: new Date(),
          handledBy: adminUserId,
          ...(note ? { adminNote: note } : {}),
        },
      },
      { new: true },
    );
    if (!updated) throw await this.payoutConflict(Model, id);
    console.log(`[admin-money] ${kind} payout ${id} marked paid by ${adminUserId} (ref ${reference})`);
    notifyPayoutOwner(kind, updated, "processed").catch((err) =>
      console.error("[admin-money] Failed to notify payout owner:", err),
    );
    return updated;
  }

  /** Rejects a requested payout; the amount goes back to the owner's balance. */
  async rejectPayout(kind: PayoutKind, id: string, adminUserId: string, reason: string) {
    const Model: any = payoutModels[kind];
    const updated = await Model.findOneAndUpdate(
      { _id: id, status: "pending" },
      { $set: { status: "failed", failureReason: reason, handledBy: adminUserId, method: "manual" } },
      { new: true },
    );
    if (!updated) throw await this.payoutConflict(Model, id);
    console.log(`[admin-money] ${kind} payout ${id} rejected by ${adminUserId}: ${reason}`);
    notifyPayoutOwner(kind, updated, "failed").catch((err) =>
      console.error("[admin-money] Failed to notify payout owner:", err),
    );
    return updated;
  }

  private async payoutConflict(Model: any, id: string) {
    const current = await Model.findById(id).select("status").lean();
    if (!current) return new AdminMoneyError(404, "Payout not found");
    return new AdminMoneyError(
      409,
      current.status === "processing"
        ? "This payout is already with RazorpayX; its status will update automatically."
        : `This payout is already ${current.status === "processed" ? "paid" : "rejected"}.`,
    );
  }
}
