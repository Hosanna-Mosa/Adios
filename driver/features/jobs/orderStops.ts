export function findStops(currentOrder: any) {
  const pickupStop = currentOrder?.stops?.find((s: any) => s.type === "pickup");
  const deliveryStop = currentOrder?.stops?.find(
    (s: any) => s.type === "delivery" || s.type === "drop",
  );
  return { pickupStop, deliveryStop };
}

/** Stops carry items either as a plain array or wrapped in a `lines` object. */
export function getFoodItems(currentOrder: any): any[] {
  if (!currentOrder?.stops) return [];
  for (const stop of currentOrder.stops) {
    const items = stop.items;
    if (!items) continue;
    if (Array.isArray(items) && items.length > 0) return items;
    if (typeof items === "object" && Array.isArray(items.lines) && items.lines.length > 0) {
      return items.lines;
    }
  }
  return [];
}

export const RIDE_SERVICE_TYPES = ["bike", "auto", "cab", "cab_prime"];

export function isRideOrder(currentOrder: any) {
  return RIDE_SERVICE_TYPES.includes(currentOrder?.serviceType?.toLowerCase() || "");
}

/** A restaurant / meat-shop order, as opposed to a package delivery, ride or helper task. */
export function isOutletOrder(currentOrder: any) {
  return !!(currentOrder?.hasOutlet || currentOrder?.vendorName);
}

export function isHelperOrder(currentOrder: any) {
  return currentOrder?.serviceType?.toLowerCase() === "helper";
}

export function formatClock(totalSeconds: number) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
