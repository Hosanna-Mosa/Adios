import type { Order } from "./types";
import i18n from "@/i18n";

const vendorField = (apiOrder: any, key: "name" | "phone") =>
  apiOrder.vendor?.[key] ||
  (apiOrder.vendor && typeof apiOrder.vendor === "object" ? apiOrder.vendor[key] : null);

/**
 * Shapes a backend order document into the client `Order`. The three call
 * sites differ only in what they fall back to for the customer/vendor fields.
 */
export function mapApiOrder(apiOrder: any, fallback?: Partial<Order>): Order {
  return {
    id: apiOrder._id || apiOrder.id,
    distance: `${apiOrder.totalDistance || 0} km`,
    duration: `${apiOrder.duration || 0} min`,
    earnings: Math.round(apiOrder.totalPrice * 0.8),
    status: apiOrder.status,
    customerName: apiOrder.user?.name || fallback?.customerName || i18n.t("jobs.customer"),
    customerPhone: apiOrder.user?.phone || fallback?.customerPhone || i18n.t("jobs.notAvailableAbbr"),
    timestamp: new Date(apiOrder.createdAt),
    serviceType: apiOrder.serviceType,
    radius: apiOrder.radius,
    restaurantPickupCode: apiOrder.restaurantPickupCode,
    deliveryOtp: apiOrder.deliveryOtp,
    polyline: apiOrder.polyline,
    vendorName: vendorField(apiOrder, "name") || fallback?.vendorName,
    vendorPhone: vendorField(apiOrder, "phone") || fallback?.vendorPhone,
    stops: apiOrder.stops.map((s: any) => ({
      id: s._id,
      type: s.type.toLowerCase() === "drop" ? "delivery" : s.type.toLowerCase(),
      locationName: s.address?.split(",")[0],
      address: s.address,
      lat: s.location.coordinates[1],
      lng: s.location.coordinates[0],
      items: s.items,
    })),
  } as Order;
}
