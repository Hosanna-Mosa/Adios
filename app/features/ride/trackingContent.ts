import i18n from "@/i18n";
import { RIDE_SERVICE_KEYS, type Stepper } from "@/components/shared/orderProgress";

// What the Tracking screen says, per service: the order code, the status message under the
// map, and the line items of the details card. Pure functions of the live order state.

/** food | meat | bike | auto | cab | cab_prime | packageDelivery | helper | delivery */
export function trackingServiceKey(opts: {
  isRide: boolean;
  isHelper: boolean;
  isPackageDelivery?: boolean;
  serviceType?: string | null;
  vendorName?: string | null;
  vendorPartnerType?: string | null;
}): string {
  if (opts.isPackageDelivery) return "packageDelivery";
  if (opts.isRide) return (opts.serviceType || "bike").toLowerCase();
  if (opts.isHelper) return "helper";
  if (opts.vendorName) return opts.vendorPartnerType === "meat" ? "meat" : "food";
  return "delivery";
}

const PREFIX: Record<string, string> = { food: "FO", meat: "MT", packageDelivery: "PK", helper: "HP", delivery: "DL" };

/** "Order ID: #FO-784321" / "Trip ID: #RD-918274" / "Service ID: #HP-771092". */
export function orderCodeLine(serviceKey: string, orderId: string | null): string {
  const isRide = RIDE_SERVICE_KEYS.includes(serviceKey);
  const prefix = isRide ? "RD" : PREFIX[serviceKey] || "OR";
  const code = `#${prefix}-${String(orderId || "").slice(-6).toUpperCase()}`;
  const label = isRide
    ? i18n.t("app.tracking.tripId", "Trip ID")
    : serviceKey === "helper"
      ? i18n.t("app.tracking.serviceId", "Service ID")
      : i18n.t("app.tracking.orderId", "Order ID");
  return `${label}: ${code}`;
}

/** The card under the map: what is happening right now, in one line and a sentence. */
export function statusMessage(serviceKey: string, steps: Stepper, waitingForRestaurant: boolean): { title: string; subtitle: string } {
  const t = (k: string, d: string) => i18n.t(`app.tracking.message.${k}`, d);
  const step = steps.current;
  if (RIDE_SERVICE_KEYS.includes(serviceKey)) {
    if (step >= 2) return { title: t("rideProgress", "Ride in Progress"), subtitle: t("rideProgressSub", "You are on your way to your destination.") };
    if (step === 1) return { title: t("captainComing", "Captain is on the way"), subtitle: t("captainComingSub", "Your captain is heading to the pickup point.") };
    return { title: t("findingCaptain", "Finding your captain"), subtitle: t("findingCaptainSub", "Hang tight, we are matching you with a captain.") };
  }
  if (serviceKey === "helper") {
    if (step >= 2) return { title: t("serviceProgress", "Service in Progress"), subtitle: t("serviceProgressSub", "Your helper is currently at your location.") };
    return { title: t("helperAssigned", "Helper assigned"), subtitle: t("helperAssignedSub", "Your helper is getting ready to start.") };
  }
  if (serviceKey === "packageDelivery" || serviceKey === "delivery") {
    if (step >= 2) return { title: t("outForDelivery", "Out for Delivery"), subtitle: t("packageOnWay", "Your package is on the way.") };
    return { title: t("pickingUp", "Picking up your package"), subtitle: t("pickingUpSub", "Your delivery partner is heading to the pickup point.") };
  }
  const meat = serviceKey === "meat";
  if (step >= 3) {
    return { title: t("outForDelivery", "Out for Delivery"), subtitle: meat ? t("meatOnWay", "Your meat order is on the way to you.") : t("foodOnWay", "Your food is on the way to you.") };
  }
  if (waitingForRestaurant) {
    return { title: t("waitingRestaurant", "Waiting for confirmation"), subtitle: t("waitingRestaurantSub", "The restaurant will confirm your order shortly.") };
  }
  return {
    title: t("preparing", "Preparing Your Order"),
    subtitle: meat ? t("meatPreparing", "The shop is getting your meat ready.") : t("foodPreparing", "The restaurant is getting your food ready."),
  };
}

export interface DetailLine {
  name: string;
  qty: number;
  /** Line total (unit price x quantity), or null when the order carries no price. */
  amount: number | null;
}

/** Items on the order, as name / quantity / amount. */
export function detailLines(deliveryStop: any, stops: any[]): DetailLine[] {
  const own = Array.isArray(deliveryStop?.items) ? deliveryStop.items : [];
  const raw = own.length ? own : (stops || []).flatMap((s: any) => (Array.isArray(s?.items) ? s.items : []));
  return raw
    .map((l: any) => {
      const name = String(l?.name || "").trim();
      if (!name) return null;
      const qty = Math.max(1, Math.round(Number(l?.quantity) || 1));
      const price = Number(l?.price);
      return { name, qty, amount: Number.isFinite(price) && price > 0 ? Math.round(price * qty) : null };
    })
    .filter(Boolean) as DetailLine[];
}

/** "25 Oct 2026". */
export function longDate(value: any): string {
  const d = value ? new Date(value) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" }) : "";
}

export function vehicleName(serviceKey: string): string {
  if (serviceKey === "bike") return i18n.t("app.orders.vehicle.bike", "Bike");
  if (serviceKey === "auto") return i18n.t("app.orders.vehicle.auto", "Auto");
  return i18n.t("app.orders.vehicle.car", "Car");
}
