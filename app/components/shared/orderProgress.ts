import { Ionicons } from "@expo/vector-icons";
import i18n from "@/i18n";

// What My Orders cards and the Tracking screen both say about an order's progress:
// the title and icon per service, and the step-by-step tracker. Shared so the card
// and the screen it opens can never disagree.

export const RIDE_SERVICE_KEYS = ["bike", "auto", "cab", "cab_prime"];

/** Icon for an order row/card, by the order's service key (food, meat, bike, auto, helper, delivery...). */
export function serviceIcon(serviceKey: string): keyof typeof Ionicons.glyphMap {
  switch (serviceKey) {
    case "food":
      return "restaurant-outline";
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
      return "person-outline";
    default:
      return "cube-outline";
  }
}

/** Heading of a card, in the service's own words: "Food Order", "Ride", "Hire a Helper"... */
export function cardTitle(serviceKey: string): string {
  const t = (k: string, d: string) => i18n.t(`app.orders.cardTitle.${k}`, d);
  if (serviceKey === "food") return t("food", "Food Order");
  if (serviceKey === "meat") return t("meat", "Meat Order");
  if (RIDE_SERVICE_KEYS.includes(serviceKey)) return t("ride", "Ride");
  if (serviceKey === "packageDelivery") return t("package", "Package Delivery");
  if (serviceKey === "helper") return t("helper", "Hire a Helper");
  return t("delivery", "Delivery");
}

// Statuses arrive in both cases from the driver/vendor/admin apps, so compare uppercased.
// How far along a live order is: 0 placed/searching, 1 rider assigned, 2 at pickup,
// 3 on the way (or task started), 4 arrived at the drop.
export const STATUS_RANK: Record<string, number> = {
  DRIVER_ASSIGNED: 1, EN_ROUTE_PICKUP: 1,
  ARRIVED_PICKUP: 2, PICKING_ITEMS: 2,
  ON_THE_WAY: 3, IN_TRANSIT: 3, IN_PROGRESS: 3, EN_ROUTE_DELIVERY: 3, PICKED_UP: 3,
  ARRIVED_DELIVERY: 4,
};

export interface Stepper {
  labels: string[];
  /** Steps before this one are done, this one is in progress, the rest are waiting. */
  current: number;
}

/**
 * The live tracker: Order Placed -> Confirmed -> Preparing -> Out for Delivery -> Delivered
 * for food and meat, with their own steps for rides, packages and helpers.
 * `status` is the backend status in either case; `waitingForRestaurant` is a food order the
 * restaurant has not accepted yet.
 */
export function buildStepper(serviceKey: string, status: string, waitingForRestaurant = false): Stepper {
  const rank = STATUS_RANK[String(status || "").toUpperCase()] ?? 0;
  const s = (k: string, d: string) => i18n.t(`app.orders.steps.${k}`, d);
  if (RIDE_SERVICE_KEYS.includes(serviceKey)) {
    return {
      labels: [s("rideAccepted", "Ride Accepted"), s("onTheWay", "On the Way"), s("inRide", "In Ride"), s("completed", "Completed")],
      current: rank >= 4 ? 3 : rank >= 3 ? 2 : rank >= 1 ? 1 : 0,
    };
  }
  if (serviceKey === "helper") {
    return {
      labels: [s("booked", "Booked"), s("assigned", "Assigned"), s("inProgress", "In Progress"), s("completed", "Completed")],
      current: rank >= 4 ? 3 : rank >= 1 ? 2 : 1,
    };
  }
  if (serviceKey === "packageDelivery" || serviceKey === "delivery") {
    return {
      labels: [s("orderPlaced", "Order Placed"), s("pickedUp", "Picked Up"), s("outForDelivery", "Out for Delivery"), s("delivered", "Delivered")],
      current: rank >= 4 ? 3 : rank >= 3 ? 2 : 1,
    };
  }
  return {
    labels: [s("orderPlaced", "Order Placed"), s("confirmed", "Confirmed"), s("preparing", "Preparing"), s("outForDelivery", "Out for Delivery"), s("delivered", "Delivered")],
    current: waitingForRestaurant ? 1 : rank >= 4 ? 4 : rank >= 3 ? 3 : 2,
  };
}
