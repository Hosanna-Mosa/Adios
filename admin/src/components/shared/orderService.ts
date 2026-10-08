import type { TFunction } from "i18next";

/**
 * Which service an order belongs to, as an admin reads it. `serviceType` alone can't
 * say: a package delivery is stored as a bike/auto ride carrying a `packageDelivery`
 * block, and a food order is a "delivery" with an outlet. Every order list and the
 * order page label orders through here so they all agree.
 */

/** The fields any order payload carries that decide its service. */
export interface OrderServiceFields {
  serviceType?: string;
  /** Set on bike/auto orders booked from the customer app's Package delivery flow. */
  packageDelivery?: unknown;
  /** Restaurant / meat-shop orders carry their outlet (an id, or the populated document). */
  vendor?: unknown;
}

export type OrderServiceKind = "packageDelivery" | "ride" | "food" | "courier" | "helper";

/** Filter / badge order, most specific first. */
export const ORDER_SERVICE_KINDS: OrderServiceKind[] = ["packageDelivery", "ride", "food", "courier", "helper"];

const RIDE_TYPES = ["bike", "auto", "cab", "cab_prime"];

export function orderServiceKind(order: OrderServiceFields): OrderServiceKind {
  const type = String(order.serviceType || "").toLowerCase();
  if (order.packageDelivery) return "packageDelivery";
  if (RIDE_TYPES.includes(type)) return "ride";
  if (type === "helper") return "helper";
  // "delivery": with an outlet it's food / meat; without one it's the multi-stop courier.
  return order.vendor ? "food" : "courier";
}

/** "Bike", "Auto", "Cab", "Cab Prime" — or "" for services that don't name a vehicle. */
export function orderVehicleLabel(serviceType: string | undefined, t: TFunction) {
  const type = String(serviceType || "").toLowerCase();
  return RIDE_TYPES.includes(type) ? t(`service.vehicle.${type}`) : "";
}

/** "Package delivery · Bike", "Ride · Auto", "Food order", "Helper task", … */
export function orderServiceLabel(order: OrderServiceFields, t: TFunction) {
  const kind = orderServiceKind(order);
  const name = t(`service.${kind}`);
  const vehicle = kind === "packageDelivery" || kind === "ride" ? orderVehicleLabel(order.serviceType, t) : "";
  return vehicle ? `${name} · ${vehicle}` : name;
}
