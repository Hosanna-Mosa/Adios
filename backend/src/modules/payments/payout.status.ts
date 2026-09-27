import DriverPayout, { DriverPayoutStatus } from "../../database/models/DriverPayout";
import VendorPayout, { VendorPayoutStatus } from "../../database/models/VendorPayout";
import { NotificationService } from "../../services/notification.service";
import {
  RazorpayXPayout,
  describeRazorpayXFailure,
  fetchRazorpayXPayout,
  getRazorpayXConfig,
  mapRazorpayXStatus,
} from "./razorpayx.client";

// One place that moves a driver/vendor payout record to the state RazorpayX reports.
// Used by the cash-out request, the payouts webhook and the balance-screen refresh.
//
// Record statuses: pending (requested, not yet with RazorpayX) → processing (RazorpayX has it)
// → processed (RazorpayX confirmed) | failed. `failed` releases the amount back to the balance,
// because balances only subtract pending/processing/processed payouts.

type PayoutKind = "driver" | "vendor";

const models = { driver: DriverPayout, vendor: VendorPayout } as const;

/** Applies a RazorpayX payout entity to our record. Returns the new status if it changed. */
export async function applyRazorpayXPayout(kind: PayoutKind, recordId: string, payout: RazorpayXPayout) {
  const Model: any = models[kind];
  const next = mapRazorpayXStatus(payout.status);

  // Allowed moves only; a replayed or out-of-order event matches nothing and changes nothing.
  const fromStatuses =
    next === "processing" ? ["pending"]
    : next === "processed" ? ["pending", "processing"]
    : payout.status === "reversed" ? ["pending", "processing", "processed"] // money came back
    : ["pending", "processing"];

  const update: Record<string, unknown> = { status: next, razorpayPayoutId: payout.id };
  if (next === "processed") {
    update.processedAt = new Date();
    if (payout.utr) update.utr = payout.utr;
  }
  if (next === "failed") update.failureReason = describeRazorpayXFailure(payout);

  const updated = await Model.findOneAndUpdate(
    { _id: recordId, status: { $in: fromStatuses } },
    { $set: update },
    { new: true },
  );
  if (!updated) return null;

  if (next === "processed" || next === "failed") {
    notifyPayoutOwner(kind, updated, next).catch((err) =>
      console.error(`[payouts] Failed to notify ${kind} about payout ${recordId}:`, err),
    );
  }
  if (next === "failed") {
    console.error(`[payouts] ALERT ${kind} payout ${recordId} ${payout.status}: ${update.failureReason}`);
  }
  return next;
}

/** Re-reads open payouts from RazorpayX (fallback when a webhook was missed). */
export async function syncOpenPayouts(kind: PayoutKind, ownerFilter: Record<string, unknown>, limit = 5) {
  const config = getRazorpayXConfig();
  if (!config) return;
  const Model: any = models[kind];
  const open = await Model.find({
    ...ownerFilter,
    status: "processing",
    razorpayPayoutId: { $exists: true, $ne: null },
    updatedAt: { $lt: new Date(Date.now() - 30_000) },
  })
    .sort({ updatedAt: 1 })
    .limit(limit);

  for (const record of open) {
    try {
      const payout = await fetchRazorpayXPayout(config, record.razorpayPayoutId);
      await applyRazorpayXPayout(kind, record._id.toString(), payout);
    } catch (error) {
      console.warn(`[payouts] Could not refresh ${kind} payout ${record._id}:`, (error as Error).message);
    }
  }
}

export async function notifyPayoutOwner(kind: PayoutKind, record: any, status: "processed" | "failed") {
  const userId = kind === "driver" ? record.user?.toString() : record.vendor?.toString();
  if (!userId) return;
  const amount = Number(record.amount).toFixed(2);
  await NotificationService.getInstance().sendNotification({
    userId,
    title: status === "processed" ? "Payout processed 💰" : "Payout failed",
    body:
      status === "processed"
        ? `₹${amount} has been sent to your bank account${record.utr ? ` (UTR ${record.utr})` : ""}.`
        : `Your ₹${amount} payout could not be completed${record.failureReason ? `: ${record.failureReason}` : ""}. The amount is back in your balance.`,
    type: "transactional",
    category: "system",
    data: { deepLink: { screen: kind === "driver" ? "/(tabs)/earnings" : "/vendor/dashboard" } },
  });
}

export { DriverPayoutStatus, VendorPayoutStatus };
