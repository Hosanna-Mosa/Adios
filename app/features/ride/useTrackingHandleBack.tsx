import { useEffect, useRef } from "react";
import { router } from "expo-router";
import { socketService } from "@/utils/socketService";
import { calculateBearing, calculateDynamicETA, normalizeStatus } from "./useTracking.shared";

// Split out of useTracking so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useTrackingHandleBack(status: any, setStatus: any, currentOrderId: any, stops: any, setDriver: any, isRide: any, isHelper: any, eta: any, setEta: any, setDeliveredAt: any, setHelperStatus: any, setDriverLocation: any, handleOrderCancelledByDriver: any, deliveryStop: any, pickupStop: any) {
  // The socket subscription below is keyed on the order, so its handlers close over
  // whatever these were at mount. Reading them through a ref keeps the ETA measured
  // against the leg the ride is actually on.
  const live = useRef({ status, stops, eta, pickupStop, deliveryStop });
  live.current = { status, stops, eta, pickupStop, deliveryStop };

  useEffect(() => {
    if (!currentOrderId) return;
    socketService.connect();
    socketService.trackOrder(currentOrderId);

    const onOrderAccepted = (data: any) => {
      setDriver(data.driver);
      setStatus("driver_assigned");
    };

    const onLocationUpdate = (data: any) => {
      if (data.lat == null || data.lng == null) return;
      setDriverLocation((prev: any) => {
        let heading = data.heading;
        if (!heading && prev) {
          const dLat = Math.abs(prev.lat - data.lat);
          const dLng = Math.abs(prev.lng - data.lng);
          heading = dLat > 0.00001 || dLng > 0.00001 ? calculateBearing(prev.lat, prev.lng, data.lat, data.lng) : prev.heading;
        }
        return { lat: data.lat, lng: data.lng, heading: heading || 0 };
      });

      const current = live.current;
      const headingToPickup = ["pending", "confirmed", "driver_assigned", "en_route_pickup", "arrived_pickup"]
        .includes(current.status);
      const activeStop = headingToPickup
        ? current.pickupStop || current.stops?.[0]
        : current.deliveryStop || current.stops?.[current.stops.length - 1];
      if (activeStop && activeStop.lat != null && activeStop.lng != null) {
        setEta(calculateDynamicETA({ lat: data.lat, lng: data.lng }, { lat: Number(activeStop.lat), lng: Number(activeStop.lng) }, current.eta));
      }
    };

    const onStatusUpdate = (data: any) => {
      if (!data.status) return;
      const statusStr = String(data.status).toLowerCase();
      if (statusStr === "cancelled" || statusStr === "cancelled_by_driver") {
        handleOrderCancelledByDriver();
        return;
      }
      const normalized = normalizeStatus(data.status);
      setStatus(normalized);
      if (normalized === "delivered") setDeliveredAt((prev: any) => prev || new Date());
    };

    const onOrderCancelled = () => handleOrderCancelledByDriver();
    const onHelperStatusUpdate = (data: { text: string }) => {
      if (data.text) setHelperStatus(data.text);
    };

    socketService.on("order_accepted", onOrderAccepted);
    socketService.on("driver_location_update", onLocationUpdate);
    socketService.on("order_status_update", onStatusUpdate);
    socketService.on("order_cancelled", onOrderCancelled);
    socketService.on("helper_status_update", onHelperStatusUpdate);

    const timer = setInterval(() => setEta((prev: any) => Math.max(1, prev - 1)), 30000);

    return () => {
      clearInterval(timer);
      socketService.off("order_accepted", onOrderAccepted);
      socketService.off("driver_location_update", onLocationUpdate);
      socketService.off("order_status_update", onStatusUpdate);
      socketService.off("order_cancelled", onOrderCancelled);
      socketService.off("helper_status_update", onHelperStatusUpdate);
    };
  }, [currentOrderId]);

  const handleBack = () => router.replace("/(tabs)/orders");
  const userLocCoords = deliveryStop ? { lat: Number(deliveryStop.lat), lng: Number(deliveryStop.lng) } : null;

  // ---------------------------------------------------------------------
  // Completed state
  // ---------------------------------------------------------------------
  // One expression rather than a `let` reassigned three times: identical
  // values and test order, but safe to compute alongside the rest of the state.
  const bannerText =
    status === "arrived_pickup"
      ? (isRide ? "Captain has arrived" : isHelper ? "Helper has arrived" : "Arrived at the store")
      : status === "en_route_delivery"
      ? (isRide ? "Trip in progress" : isHelper ? "Task in progress" : "Out for delivery")
      : status === "arrived_delivery"
      ? (isRide ? "Arrived at destination" : "Arrived at your location")
      : (isHelper ? "Helper is on the way" : isRide ? "Captain on the way" : "Heading to pickup");

  return { handleBack, userLocCoords, bannerText };
}
