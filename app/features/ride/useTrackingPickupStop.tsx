import { useEffect } from "react";
import { foodStageOf, nextDriverLocation, normalizeStatus } from "./useTracking.shared";
import { getOrder } from "@/services/orders.service";
import { useDeliveryStore } from "@/contexts/deliveryStore";

// Split out of useTracking so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useTrackingPickupStop(setStatus: any, currentOrderId: any, setServiceType: any, setRoute: any, stops: any, setStops: any, setDriver: any, setVendorName: any, setVendorPartnerType: any, setEta: any, setOrderCreatedAt: any, setDeliveredAt: any, setDeliveryOtp: any, setStartOtp: any, setDriverLocation: any, setRadius: any, setTotalPrice: any, handleOrderCancelledByDriver: any) {
  const pickupStop = stops?.find((s: any) => s.type?.toLowerCase() === "pickup" || s.type?.toLowerCase() === "store");
  const setFoodStage = useDeliveryStore((s) => s.setFoodStage);

  useEffect(() => {
    if (!currentOrderId) return;

    const fetchOrderDetails = () => {
      getOrder(currentOrderId)
        .then((order) => {
          if (!order) return;
          if (order.status) {
            const statusStr = String(order.status).toLowerCase();
            if (statusStr === "cancelled" || statusStr === "cancelled_by_driver") {
              handleOrderCancelledByDriver(order.cancelReason);
              return;
            }
            const normalized = normalizeStatus(order.status);
            setStatus(normalized);
            setFoodStage(foodStageOf(order));
            if (normalized === "delivered") setDeliveredAt((prev: any) => prev || new Date());
          }
          if (order.driver) {
            setDriver({
              id: order.driver._id,
              name: order.driver.name || order.driver.user?.name || order.driver.firstName || "Driver",
              phone: order.driver.phone || order.driver.user?.phone || "",
              vehicle: order.driver.vehicleType || "unknown",
              // Averaged from this driver's reviews server-side; null until they
              // have any, which the partner row renders as "New" rather than 0.
              rating: order.driver.rating ?? null,
              ratingCount: order.driver.ratingCount ?? 0,
            });
            if (order.driver.currentLocation?.coordinates) {
              const coords = order.driver.currentLocation.coordinates;
              if (coords[0] != null && coords[1] != null) {
                setDriverLocation((prev: any) => {
                  const lat = coords[1];
                  const lng = coords[0];
                  if (!prev || Math.abs(prev.lat - lat) > 0.00001 || Math.abs(prev.lng - lng) > 0.00001) {
                    return nextDriverLocation(prev, lat, lng);
                  }
                  return prev;
                });
              }
            }
          }
          if (order.vendor && typeof order.vendor === "object") {
            setVendorName(order.vendor.name || null);
            setVendorPartnerType(order.vendor.partnerType || null);
          } else if (order.outlet) {
            // GET /orders/:id sends the vendor as a bare id, with its name in `outlet`.
            setVendorName(order.outlet.name || null);
            setVendorPartnerType(order.outlet.partnerType || null);
          }
          if (order.stops?.length > 0) {
            setStops(
              order.stops.map((s: any) => ({
                id: s._id,
                address: s.address,
                lat: s.location.coordinates[1],
                lng: s.location.coordinates[0],
                type: s.type,
                items: s.items?.lines || [],
              }))
            );
          }
          if (order.radius) setRadius(order.radius);
          if (order.deliveryOtp) setDeliveryOtp(order.deliveryOtp);
          if (order.serviceType) setServiceType(order.serviceType);
          if (order.restaurantPickupCode) setStartOtp(order.restaurantPickupCode);
          if (order.totalPrice != null) setTotalPrice(order.totalPrice);
          if (order.createdAt) setOrderCreatedAt((prev: any) => prev || new Date(order.createdAt));
          // The route's time is only a first estimate: once the driver's live position
          // has produced one, this 7-second poll must not reset it.
          if (order.duration) {
            const durMinutes = parseInt(order.duration.toString().replace(/[^0-9]/g, ""), 10);
            if (durMinutes > 0) setEta((prev: number | null) => prev ?? durMinutes);
          }
          if (order.polyline) {
            setRoute({ totalDistance: order.totalDistance || 0, estimatedTime: order.duration || 0, polyline: order.polyline });
          }
        })
        .catch((err) => console.error("Error fetching order in tracking:", err));
    };

    fetchOrderDetails();
    const interval = setInterval(fetchOrderDetails, 7000);
    return () => clearInterval(interval);
  }, [currentOrderId]);

  return { pickupStop };
}
