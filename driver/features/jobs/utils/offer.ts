/** Reading an incoming order offer: what kind of job it is, what's in it,
 * and how to title it. Pure functions, lifted out of IncomingOrderModal. */
import i18n from "@/i18n";

export function isHelperJob(serviceType?: string | null) {
  return serviceType?.toLowerCase() === "helper";
}

export function isRideJob(serviceType?: string | null) {
  return ["bike", "auto", "cab", "cab_prime"].includes(serviceType?.toLowerCase() || "");
}

/** Items live on whichever stop carries them, either as an array or under
 * `lines` — return the first non-empty list found. */
export function getFoodItems(order: { stops?: any[] } | null | undefined): any[] {
  if (!order?.stops) return [];
  for (const stop of order.stops) {
    const items = stop.items;
    if (!items) continue;
    if (Array.isArray(items) && items.length > 0) return items;
    if (
      items &&
      typeof items === "object" &&
      (items as any).lines &&
      Array.isArray((items as any).lines) &&
      (items as any).lines.length > 0
    ) {
      return (items as any).lines;
    }
  }
  return [];
}

export function offerTitle({
  isReserved,
  isRide,
  isHelper,
}: {
  isReserved?: boolean;
  isRide: boolean;
  isHelper: boolean;
}) {
  if (isReserved) return i18n.t("jobs.newReservedRide");
  if (isRide) return i18n.t("jobs.newRideRequest");
  if (isHelper) return i18n.t("jobs.newHelper");
  return i18n.t("jobs.newDeliveryRequest");
}

/** reservedAt arrives as an ISO string from the API, but the Order type
 * also allows a Date, so accept both. */
export function formatReservedAt(reservedAt?: string | Date | null) {
  if (!reservedAt) return i18n.t("jobs.notAvailableAbbr");
  return new Date(reservedAt).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Average city speed for a rough ETA — the same 22 km/h the customer app's tracking uses.
const APPROACH_SPEED_KMH = 22;

/**
 * How far the driver is from the job's pickup, and roughly how long to get there.
 * Null without the driver's position or a pickup point. The offer used to show only
 * the trip (pickup → drop) distance and time with no labels, which read as the
 * pickup distance and ETA — and looked wrong.
 */
export function pickupApproach(
  driver: { lat: number; lng: number } | null | undefined,
  stops: { type?: string; lat?: number; lng?: number }[] | null | undefined,
): { km: number; minutes: number } | null {
  const pickup = (stops || []).find((s) => s.type === "pickup") || stops?.[0];
  if (!driver || pickup?.lat == null || pickup?.lng == null) return null;
  const rad = Math.PI / 180;
  const dLat = (pickup.lat - driver.lat) * rad;
  const dLng = (pickup.lng - driver.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(driver.lat * rad) * Math.cos(pickup.lat * rad) * Math.sin(dLng / 2) ** 2;
  const km = 2 * 6371 * Math.asin(Math.sqrt(h));
  return { km: Math.round(km * 10) / 10, minutes: Math.max(1, Math.round((km / APPROACH_SPEED_KMH) * 60)) };
}
