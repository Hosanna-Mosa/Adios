import type { PartnerOrder, ScheduledRequest } from "@/types/models";
import { needsAction } from "@/utils/orderStatus";

// Which polled orders and scheduled requests deserve a ring. LiveOrderWatcher
// keeps the ids it has already seen; anything in the latest poll that isn't
// among them is new. Kept free of React so the rules can be unit-tested.

/** A new order older than this is not rung for — e.g. one still open from before a reload. */
export const NEW_ORDER_ALERT_WINDOW_MS = 30 * 60_000;

/**
 * Orders from this poll that weren't seen before and still wait on the kitchen
 * (accept, or mark as ready), placed within the alert window.
 */
export function newOrdersToAlert(orders: PartnerOrder[], known: ReadonlySet<string>, now: number = Date.now()): PartnerOrder[] {
  return orders.filter((order) => {
    if (!order._id || known.has(order._id) || !needsAction(order)) return false;
    const placedAt = new Date(order.createdAt).getTime();
    return Number.isFinite(placedAt) && now - placedAt <= NEW_ORDER_ALERT_WINDOW_MS;
  });
}

/** Scheduled requests from this poll that weren't seen before and still wait for an answer. */
export function newScheduledRequestsToAlert(requests: ScheduledRequest[], known: ReadonlySet<string>): ScheduledRequest[] {
  return requests.filter((request) => !!request.requestId && !known.has(request.requestId) && request.status === "pending");
}
