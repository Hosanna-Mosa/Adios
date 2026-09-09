

// Module-level values shared by the parts of useOrders.

export const TERMINAL_STATUSES = ["DELIVERED", "COMPLETED", "CANCELLED", "REJECTED"];

export const RIDE_TYPES = ["bike", "auto", "cab", "cab_prime"];

export function isTerminalOrder(order: any): boolean {
  return TERMINAL_STATUSES.includes(String(order?.status || "").toUpperCase());
}

export function isScheduledOrder(order: any): boolean {
  return !!order?.scheduledFor || !!order?.isReserved || order?.scheduledDelivery?.type === "later";
}

export /**
 * Stop lines are persisted as `items: { lines: [...] }`, and every order now
 * also carries a flat top-level `items`. Prefer the flat one and fall back for
 * anything stored before it existed.
 */
function readOrderLines(order: any): any[] {
  if (Array.isArray(order?.items) && order.items.length) return order.items;
  const stops = Array.isArray(order?.stops) ? order.stops : [];
  return stops.flatMap((stop: any) => readStopLines(stop));
}

export function readStopLines(stop: any): any[] {
  const raw = stop?.items;
  if (Array.isArray(raw)) return raw;
  return Array.isArray(raw?.lines) ? raw.lines : [];
}

export function toCartItem(line: any) {
  return {
    _id: String(line?.id || line?._id || line?.itemId || ""),
    name: String(line?.name || "Item"),
    description: String(line?.description || ""),
    price: Number(line?.price) || 0,
    category: String(line?.category || ""),
    isVeg: line?.isVeg !== false,
    images: Array.isArray(line?.images) && line.images.length
      ? line.images
      : line?.image
        ? [String(line.image)]
        : [],
    quantity: Math.max(1, Math.round(Number(line?.quantity) || 1)),
  };
}

export function resolveServiceKey(order: any): string {
  if (order.serviceType === "delivery" && order.vendor) {
    // GET /api/v1/orders doesn't populate vendor (it's a raw id here), so
    // there's no real field to tell a food order from a meat one at this
    // list level — labelled "Food" as the more common case rather than
    // guessing from a partnerType that isn't actually present on this
    // response.
    return "food";
  }
  return order.serviceType || "delivery";
}
