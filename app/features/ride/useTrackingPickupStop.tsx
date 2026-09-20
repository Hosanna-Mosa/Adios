import { useEffect } from "react";
import { calculateBearing, normalizeStatus } from "./useTracking.shared";
import { getOrder } from "@/services/orders.service";

// Split out of useTracking so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useTrackingPickupStop(setStatus: any, currentOrderId: any, setServiceType: any, setRoute: any, stops: any, setStops: any, setDriver: any, setVendorName: any, setVendorPartnerType: any, setEta: any, setOrderCreatedAt: any, setDeliveredAt: any, setDeliveryOtp: any, setStartOtp: any, setDriverLocation: any, setRadius: any, setTotalPrice: any, handleOrderCancelledByDriver: any) {
  const pickupStop = stops?.find((s: any) => s.type?.toLowerCase() === "pickup" || s.type?.toLowerCase() === "store");

  useEffect(() => {
    if (!currentOrderId) return;

    const fetchOrderDetails = () => {
      getOrder(currentOrderId)
        .then((order) => {
          if (!order) return;
          if (order.status) {
            const statusStr = String(order.status).toLowerCase();
            if (statusStr === "cancelled" || statusStr === "cancelled_by_driver") {
              handleOrderCancelledByDriver();
              return;
            }
            const normalized = normalizeStatus(order.status);
            setStatus(normalized);
            if (normalized === "delivered") setDeliveredAt((prev: any) => prev || new Date());
          }
          if (order.driver) {
            setDriver({
              id: order.driver._id,
              name: order.driver.name || order.driver.user?.name || order.driver.firstName || "Driver",
              phone: order.driver.phone || order.driver.user?.phone || "",
              vehicle: order.driver.vehicleType || "unknown",
            });
            if (order.driver.currentLocation?.coordinates) {
              const coords = order.driver.currentLocation.coordinates;
              if (coords[0] != null && coords[1] != null) {
                setDriverLocation((prev: any) => {
                  const lat = coords[1];
                  const lng = coords[0];
                  if (!prev || Math.abs(prev.lat - lat) > 0.00001 || Math.abs(prev.lng - lng) > 0.00001) {
                    const heading = prev && (prev.lat !== lat || prev.lng !== lng) ? calculateBearing(prev.lat, prev.lng, lat, lng) : prev?.heading || 0;
                    return { lat, lng, heading };
                  }
                  return prev;
                });
              }
            }
          }
          if (order.vendor && typeof order.vendor === "object") {
            setVendorName(order.vendor.name || null);
            setVendorPartnerType(order.vendor.partnerType || null);
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
          if (order.duration) {
            const durMinutes = parseInt(order.duration.toString().replace(/[^0-9]/g, ""), 10) || 15;
            setEta(durMinutes);
          }
          if (order.polyline) {
            setRoute({ totalDistance: order.totalDistance || 0, estimatedTime: order.duration || 15, polyline: order.polyline });
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
