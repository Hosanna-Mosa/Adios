import type { Order } from "./types";
import i18n from "@/i18n";

const vendorField = (apiOrder: any, key: "name" | "phone") =>
  apiOrder.vendor?.[key] ||
  (apiOrder.vendor && typeof apiOrder.vendor === "object" ? apiOrder.vendor[key] : null);

/**
 * Payment facts as the backend stored them. Anything that isn't a confirmed online payment is
 * treated as cash, so the app never tells a driver "paid online" for money nobody received.
 */
export function paymentFields(apiOrder: any): Pick<Order, "paymentMethod" | "paymentStatus" | "payableAmount" | "cashCollected" | "cashCollectedAmount"> {
  const paidOnline = apiOrder?.paymentMethod === "online" && apiOrder?.paymentStatus === "paid";
  return {
    paymentMethod: paidOnline ? "online" : "cash",
    paymentStatus: apiOrder?.paymentStatus || "pending",
    payableAmount: Math.round(Number(apiOrder?.payableAmount ?? apiOrder?.totalPrice) || 0),
    cashCollected: !!apiOrder?.cashCollected,
    cashCollectedAmount: apiOrder?.cashCollectedAmount ?? null,
  };
}

/** "1 hr" / "2.5 hrs" for a helper task's booked hours. */
export function formatBookedHours(hours?: number | null) {
  const value = Number(hours) || 0;
  return value === 1 ? i18n.t("jobs.oneHour") : i18n.t("jobs.hoursShortN", { value });
}

/**
 * Shapes a backend order document into the client `Order`. The three call
 * sites differ only in what they fall back to for the customer/vendor fields.
 */
export function mapApiOrder(apiOrder: any, fallback?: Partial<Order>): Order {
  // A helper task's `duration` is the hours the customer booked; for everything else it's minutes.
  const isHelper = apiOrder.serviceType?.toLowerCase() === "helper";
  const bookedHours = isHelper ? Number(apiOrder.duration) || fallback?.bookedHours || 0 : undefined;
  return {
    id: apiOrder._id || apiOrder.id,
    distance: `${apiOrder.totalDistance || 0} km`,
    duration: isHelper ? formatBookedHours(bookedHours) : `${apiOrder.duration || 0} min`,
    earnings: Math.round(apiOrder.totalPrice * 0.8),
    status: apiOrder.status,
    customerName: apiOrder.user?.name || fallback?.customerName || i18n.t("jobs.customer"),
    customerPhone: apiOrder.user?.phone || fallback?.customerPhone || i18n.t("jobs.notAvailableAbbr"),
    timestamp: new Date(apiOrder.createdAt),
    serviceType: apiOrder.serviceType,
    radius: apiOrder.radius,
    // Never sent for helper tasks: the helper types the customer's codes and the server checks them.
    restaurantPickupCode: apiOrder.restaurantPickupCode,
    deliveryOtp: apiOrder.deliveryOtp,
    ...(isHelper
      ? {
          bookedHours,
          taskDescription:
            apiOrder.stops?.[0]?.items?.instructions || fallback?.taskDescription || "",
          assignConfirmedAt: apiOrder.assignConfirmedAt ?? fallback?.assignConfirmedAt ?? null,
          taskStartedAt: apiOrder.taskStartedAt ?? null,
          taskCompletedAt: apiOrder.taskCompletedAt ?? null,
        }
      : {}),
    polyline: apiOrder.polyline,
    ...paymentFields(apiOrder),
    packageDelivery: apiOrder.packageDelivery ?? fallback?.packageDelivery ?? null,
    hasOutlet: !!apiOrder.vendor || !!fallback?.hasOutlet,
    foodReadyAt: apiOrder.foodReadyAt ?? fallback?.foodReadyAt ?? null,
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
