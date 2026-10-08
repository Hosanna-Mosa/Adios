import type { Order } from "@/store/types";

/**
 * Payout shown on the completion screens, from the order itself.
 *
 * The backend sends a single figure for the driver's pay — `earnings` on the
 * order, the same 80% of the fare it credits to the wallet — and no per-line
 * split: the order's priceBreakdown is the customer's fare, not the driver's
 * pay, and orders carry no separate tip. So the total is that figure, and the
 * only other line is the trip's real distance when the order has one. This
 * used to invent a base fare, ₹6/km, and surge/peak/rain/tip bonuses.
 */
export function orderPayout(order: Pick<Order, "earnings" | "distance"> | null | undefined) {
  const hasDistance = parseFloat(order?.distance || "") > 0;
  return {
    total: Number(order?.earnings) || 0,
    /** Undefined when the order has no distance, so the row is left out. */
    distance: hasDistance ? order?.distance : undefined,
  };
}
