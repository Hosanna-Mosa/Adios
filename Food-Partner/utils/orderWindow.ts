import type { PartnerOrder } from "@/types/models";

// How the outlet's orders are windowed: a small "live" set kept fresh by the
// socket (today's orders plus anything still in progress), and the history
// before today, loaded a page at a time as the partner scrolls.

/** Midnight at the start of the device's today — where the live set begins and history ends. */
export function startOfToday(now: Date = new Date()): Date {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return start;
}

/** The `before` cursor for the next history page, or undefined once a page comes back short. */
export function nextHistoryCursor(lastPage: PartnerOrder[], pageSize: number): string | undefined {
  if (lastPage.length < pageSize) return undefined;
  return lastPage[lastPage.length - 1]?.createdAt;
}

/**
 * Several order lists as one, newest first, each order once. Earlier lists win
 * a tie, so pass the live set first: it is refetched far more often than an
 * already-loaded history page, so its copy of an order is the fresher one.
 */
export function mergeOrders(...lists: (PartnerOrder[] | undefined)[]): PartnerOrder[] {
  const byId = new Map<string, PartnerOrder>();
  for (const list of lists) {
    for (const order of list ?? []) {
      if (!byId.has(order._id)) byId.set(order._id, order);
    }
  }
  return [...byId.values()].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
