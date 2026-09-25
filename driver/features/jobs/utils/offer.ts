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

/** reservedAt arrives as an ISO string from the API but as a Date from the
 * mock order helper, so accept both. */
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
