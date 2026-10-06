import type { PartnerOrder } from "@/types/models";

// What an order's status means to a restaurant. The labels, and the statuses
// that allow "Mark as ready", are the web panel's (getStatusDisplay and
// READY_ELIGIBLE_STATUSES in admin/src/features/vendors), so the panel and
// this app never disagree about an order.

export type StatusTone = "brand" | "success" | "warning" | "error" | "neutral" | "info";

export interface StatusMeta {
  /** i18n key under orderStatus.* */
  labelKey: string;
  tone: StatusTone;
}

const META: Record<string, StatusMeta> = {
  created: { labelKey: "orderStatus.searchingDriver", tone: "info" },
  searching_driver: { labelKey: "orderStatus.searchingDriver", tone: "info" },
  confirmed: { labelKey: "orderStatus.confirmed", tone: "info" },
  driver_assigned: { labelKey: "orderStatus.driverAssigned", tone: "warning" },
  en_route_pickup: { labelKey: "orderStatus.driverOnTheWay", tone: "warning" },
  arrived_pickup: { labelKey: "orderStatus.driverArrived", tone: "warning" },
  picking_items: { labelKey: "orderStatus.readyForPickup", tone: "brand" },
  on_the_way: { labelKey: "orderStatus.outForDelivery", tone: "info" },
  en_route_delivery: { labelKey: "orderStatus.outForDelivery", tone: "info" },
  in_transit: { labelKey: "orderStatus.outForDelivery", tone: "info" },
  in_progress: { labelKey: "orderStatus.outForDelivery", tone: "info" },
  arrived_delivery: { labelKey: "orderStatus.driverAtCustomer", tone: "info" },
  delivered: { labelKey: "orderStatus.delivered", tone: "success" },
  completed: { labelKey: "orderStatus.delivered", tone: "success" },
  cancelled: { labelKey: "orderStatus.cancelled", tone: "error" },
};

const READY_ELIGIBLE = ["created", "searching_driver", "driver_assigned", "arrived_pickup"];
const DONE = ["delivered", "completed"];

/** Prep times the kitchen can quote when accepting a food order, in minutes. */
export const PREP_TIME_OPTIONS = [10, 15, 20, 30, 45, 60];
export const DEFAULT_PREP_MINUTES = 20;

const norm = (status: string | undefined) => (status || "").toLowerCase();

export const statusMeta = (status: string | undefined): StatusMeta =>
  META[norm(status)] ?? { labelKey: "orderStatus.unknown", tone: "neutral" };

/** The kitchen still has to hand this order over — "Mark as ready" applies (by status alone). */
export const canMarkReady = (status: string | undefined) => READY_ELIGIBLE.includes(norm(status));

/** A food order the restaurant hasn't accepted yet. No rider is searched for until it is. */
export const needsAcceptance = (order: PartnerOrder | undefined | null) =>
  !!order && order.dispatchMode === "broadcast" && norm(order.status) === "created" && !order.restaurantAcceptedAt;

/** "Mark as ready" applies: accepted (food orders), not marked ready already, and still before pickup. */
export const canMarkOrderReady = (order: PartnerOrder | undefined | null) =>
  !!order && !needsAcceptance(order) && !order.foodReadyAt && canMarkReady(order.status);

/** The kitchen has something to do on this order: accept it, or mark it ready. */
export const needsAction = (order: PartnerOrder) => needsAcceptance(order) || canMarkOrderReady(order);

/** The status label for one order, including the food-order states the status alone can't show. */
export const orderStatusMeta = (order: PartnerOrder): StatusMeta => {
  if (needsAcceptance(order)) return { labelKey: "orderStatus.newOrder", tone: "warning" };
  if (isCancelled(order.status) && order.cancelReason === "restaurant_timeout") {
    return { labelKey: "orderStatus.cancelledNotAccepted", tone: "error" };
  }
  if (order.dispatchMode === "broadcast" && order.foodReadyAt && norm(order.status) === "searching_driver") {
    return { labelKey: "orderStatus.readyFindingDriver", tone: "brand" };
  }
  if (order.dispatchMode === "broadcast" && norm(order.status) === "searching_driver") {
    return { labelKey: "orderStatus.preparingFindingDriver", tone: "info" };
  }
  return statusMeta(order.status);
};

export const isCompleted = (status: string | undefined) => DONE.includes(norm(status));

export const isCancelled = (status: string | undefined) => norm(status) === "cancelled";

/** Still moving: not delivered and not cancelled. */
export const isActive = (status: string | undefined) => !isCompleted(status) && !isCancelled(status);

export const orderItems = (order: PartnerOrder) => order.stops?.find((s) => s.type === "drop")?.items?.lines ?? [];

export const orderItemCount = (order: PartnerOrder) => orderItems(order).reduce((sum, line) => sum + (line.quantity || 0), 0);

export const deliveryAddress = (order: PartnerOrder) => {
  const drop = order.stops?.find((s) => s.type === "drop");
  return drop?.items?.deliveryAddress?.formattedAddress || drop?.address || "";
};

export const customerOf = (order: PartnerOrder) =>
  order.user && typeof order.user === "object" ? order.user : null;

export const driverOf = (order: PartnerOrder) =>
  order.driver && typeof order.driver === "object" ? order.driver : null;
