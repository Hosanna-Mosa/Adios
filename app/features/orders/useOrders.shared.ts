

import { type ServiceKey } from "@/constants/colors";

// Module-level values shared by the parts of useOrders.

export const TERMINAL_STATUSES = ["DELIVERED", "COMPLETED", "CANCELLED", "REJECTED"];

export const RIDE_TYPES = ["bike", "auto", "cab", "cab_prime"];

/**
 * The service filters, as the chips row and the filter sheet both render them.
 *
 * One entry per *service the customer recognises*, not per stored serviceType —
 * the four ride types are one "Ride" filter. Both surfaces used to iterate
 * SERVICE_META and drop the ride keys outright, which left rides unfilterable
 * and their orders uncounted.
 *
 * `label` is the English fallback; render `t(labelKey)` (the same
 * app.serviceMeta.* keys SERVICE_META uses).
 */
export const SERVICE_CHIPS: { label: string; labelKey: string; accent: ServiceKey; keys: string[] }[] = [
  { label: "Food", labelKey: "app.serviceMeta.food", accent: "food", keys: ["food"] },
  { label: "Meat", labelKey: "app.serviceMeta.meat", accent: "meat", keys: ["meat"] },
  { label: "Ride", labelKey: "app.serviceMeta.ride", accent: "ride", keys: RIDE_TYPES },
  { label: "Task", labelKey: "app.serviceMeta.task", accent: "task", keys: ["helper"] },
  { label: "Delivery", labelKey: "app.serviceMeta.delivery", accent: "delivery", keys: ["delivery"] },
];

/** A chip is on only when every service key behind it is selected. */
export const isChipActive = (filters: Set<string>, keys: string[]) => keys.every((k) => filters.has(k));

export const toggleChipKeys = (filters: Set<string>, keys: string[]) => {
  const next = new Set(filters);
  if (isChipActive(filters, keys)) keys.forEach((k) => next.delete(k));
  else keys.forEach((k) => next.add(k));
  return next;
};

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
    // GET /api/v1/orders sends the outlet as { _id, name, image, partnerType }.
    // An older backend sent a bare id, with nothing to tell food from meat, so
    // that case stays "Food" as the more common one.
    return typeof order.vendor === "object" && order.vendor.partnerType === "meat" ? "meat" : "food";
  }
  return order.serviceType || "delivery";
}
