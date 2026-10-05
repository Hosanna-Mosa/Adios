import { Ionicons } from "@expo/vector-icons";
import i18n from "@/i18n";

/** Icon for an order row/card, by the order's service key (food, meat, bike, auto, helper, delivery…). */
export function serviceIcon(serviceKey: string): keyof typeof Ionicons.glyphMap {
  switch (serviceKey) {
    case "food":
      return "fast-food-outline";
    case "meat":
      return "nutrition-outline";
    case "bike":
      return "bicycle-outline";
    case "auto":
    case "cab":
      return "car-outline";
    case "cab_prime":
      return "car-sport-outline";
    case "helper":
      return "construct-outline";
    default:
      return "cube-outline";
  }
}

// Statuses arrive in both cases from the driver/vendor/admin apps, so compare uppercased.
// How far along a live order is: 0 placed/searching, 1 rider assigned, 2 at pickup,
// 3 on the way (or task started), 4 arrived at the drop.
const STATUS_RANK: Record<string, number> = {
  DRIVER_ASSIGNED: 1, EN_ROUTE_PICKUP: 1,
  ARRIVED_PICKUP: 2, PICKING_ITEMS: 2,
  ON_THE_WAY: 3, IN_TRANSIT: 3, IN_PROGRESS: 3, EN_ROUTE_DELIVERY: 3, PICKED_UP: 3,
  ARRIVED_DELIVERY: 4,
};

const RIDE_KEYS = ["bike", "auto", "cab", "cab_prime"];

export interface LiveSteps {
  labels: string[];
  done: boolean[];
  /** Index of the step in progress: the first one not yet done. */
  current: number;
}

/**
 * The live order's checklist, with the same steps and the same "done" rules as the
 * tracking screen's timeline (app/tracking.tsx buildTimeline), so the card and the
 * screen it opens never disagree about where the order is.
 */
export function liveSteps(order: any, serviceKey: string): LiveSteps {
  const rank = STATUS_RANK[String(order?.status || "").toUpperCase()] ?? 0;
  const t = (key: string) => i18n.t(`app.tracking.${key}`);
  let labels: string[];
  let done: boolean[];
  if (RIDE_KEYS.includes(serviceKey)) {
    labels = [t("rideLabels.captainAssigned"), t("rideLabels.headingToPickup"), t("rideLabels.tripInProgress"), t("rideLabels.tripCompleted")];
    done = [rank >= 1, rank >= 2, rank >= 4, false];
  } else if (serviceKey === "helper") {
    labels = [t("helperLabels.helperAssigned"), t("helperLabels.taskInProgress"), t("helperLabels.taskCompleted")];
    done = [rank >= 1, rank >= 3, false];
  } else {
    labels = [t("deliveryLabels.orderPlaced"), t("deliveryLabels.prepared"), t("deliveryLabels.outForDelivery"), t("deliveryLabels.delivered")];
    done = [true, rank >= 3, rank >= 4, false];
  }
  return { labels, done, current: done.indexOf(false) };
}

/** Total quantity of items on a food / meat order, or 0 when it has none. */
export function itemCount(order: any): number {
  const lines = Array.isArray(order?.items) ? order.items : [];
  return lines.reduce((sum: number, line: any) => sum + (Number(line?.quantity) || 1), 0);
}

/** Where the order is headed: the drop for deliveries and rides, the task spot for helpers. */
export function destination(order: any, serviceKey: string): string {
  const stops = (order?.stops || []).filter((s: any) => s?.address);
  if (!stops.length) return "";
  return serviceKey === "helper" ? stops[0].address : stops[stops.length - 1].address;
}

/** The outlet name for food / meat orders: the populated vendor, else the pickup stop. */
export function outletName(order: any): string {
  if (order?.vendor && typeof order.vendor === "object" && order.vendor.name) return order.vendor.name;
  return order?.stops?.[0]?.address || i18n.t("app.orders.orderFallback", "Order");
}

/** "2:28 PM" style time, or "" when the value isn't a date. */
export function clockTime(value: any): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/** Restaurant name, or the route for rides / courier orders. */
export function orderTitle(order: any): string {
  if (order?.vendor && typeof order.vendor === "object" && order.vendor.name) return order.vendor.name;
  const route = (order?.stops || []).map((s: any) => s?.address).filter(Boolean).join(" → ");
  return route || i18n.t("app.orders.orderFallback", "Order");
}

/** "12 Mar" style date for list rows, or "" when the order has none. */
export function shortDate(value: any): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString([], { day: "numeric", month: "short" });
}
