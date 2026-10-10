import { useCallback, useEffect, useRef } from "react";
import { BackHandler } from "react-native";
import { router, useFocusEffect } from "expo-router";
import i18n from "@/i18n";
import { socketService } from "@/utils/socketService";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { calculateDynamicETA, nextDriverLocation, nextFoodStage, normalizeStatus } from "./useTracking.shared";

// Split out of useTracking so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

// Leaving live tracking always lands on Home. A plain back() returned to whatever
// opened tracking, usually the "Finding your rider" screen for an order that
// already has a rider. dismissTo pops the whole flow (checkout, finding-driver,
// tracking) off the stack, so nothing stale is left underneath.
export const goHomeFromTracking = () => router.dismissTo("/(tabs)");

export function useTrackingHandleBack(status: any, setStatus: any, currentOrderId: any, stops: any, setDriver: any, isRide: any, isHelper: any, eta: any, setEta: any, setDeliveredAt: any, setHelperStatus: any, setDriverLocation: any, handleOrderCancelledByDriver: any, deliveryStop: any, pickupStop: any) {
  // The socket subscription below is keyed on the order, so its handlers close over
  // whatever these were at mount. Reading them through a ref keeps the ETA measured
  // against the leg the ride is actually on.
  const live = useRef({ status, stops, eta, pickupStop, deliveryStop });
  live.current = { status, stops, eta, pickupStop, deliveryStop };
  const foodStage = useDeliveryStore((s) => s.foodStage);

  useEffect(() => {
    if (!currentOrderId) return;
    socketService.connect();
    socketService.trackOrder(currentOrderId);
    const { setFoodStage } = useDeliveryStore.getState();
    // Events for the customer's other orders reach the same socket; payloads that
    // name an order are only applied to this one.
    const isOther = (data: any) => data?.orderId != null && String(data.orderId) !== String(currentOrderId);

    const onOrderAccepted = (data: any) => {
      if (isOther(data)) return;
      setDriver(data.driver);
      setStatus("driver_assigned");
      setFoodStage(null);
    };

    const onLocationUpdate = (data: any) => {
      if (data.lat == null || data.lng == null) return;
      setDriverLocation((prev: any) => nextDriverLocation(prev, data.lat, data.lng, data.heading));

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
      if (!data?.status || isOther(data)) return;
      const statusStr = String(data.status).toLowerCase();
      if (statusStr === "cancelled" || statusStr === "cancelled_by_driver") {
        handleOrderCancelledByDriver(data.reason);
        return;
      }
      const normalized = normalizeStatus(data.status);
      setStatus(normalized);
      setFoodStage(nextFoodStage(useDeliveryStore.getState().foodStage, data.status));
      if (normalized === "delivered") setDeliveredAt((prev: any) => prev || new Date());
    };

    const onOrderCancelled = (data: any) => {
      if (!isOther(data)) handleOrderCancelledByDriver();
    };
    const onHelperStatusUpdate = (data: { orderId?: string; text: string }) => {
      if (data?.text && !isOther(data)) setHelperStatus(data.text);
    };

    socketService.on("order_accepted", onOrderAccepted);
    socketService.on("driver_location_update", onLocationUpdate);
    socketService.on("order_status_update", onStatusUpdate);
    socketService.on("order_cancelled", onOrderCancelled);
    socketService.on("helper_status_update", onHelperStatusUpdate);

    return () => {
      socketService.off("order_accepted", onOrderAccepted);
      socketService.off("driver_location_update", onLocationUpdate);
      socketService.off("order_status_update", onStatusUpdate);
      socketService.off("order_cancelled", onOrderCancelled);
      socketService.off("helper_status_update", onHelperStatusUpdate);
    };
  }, [currentOrderId]);

  // Android's hardware back follows the on-screen arrow (iOS swipe-back is off for this screen).
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        goHomeFromTracking();
        return true;
      });
      return () => sub.remove();
    }, []),
  );

  const handleBack = () => router.replace("/(tabs)/orders");
  const userLocCoords = deliveryStop ? { lat: Number(deliveryStop.lat), lng: Number(deliveryStop.lng) } : null;

  // ---------------------------------------------------------------------
  // Completed state
  // ---------------------------------------------------------------------
  // One expression rather than a `let` reassigned three times: identical
  // values and test order, but safe to compute alongside the rest of the state.
  const bannerText =
    foodStage === "awaiting_restaurant"
      ? i18n.t("app.tracking.waitingForRestaurant")
      : foodStage === "preparing"
      ? i18n.t("app.tracking.restaurantPreparing")
      : status === "arrived_pickup"
      ? i18n.t(isRide ? "app.tracking.banner.riderArrived" : isHelper ? "app.tracking.banner.helperArrived" : "app.tracking.banner.arrivedAtStore")
      : status === "en_route_delivery"
      ? i18n.t(isRide ? "app.tracking.banner.tripInProgress" : isHelper ? "app.tracking.banner.taskInProgress" : "app.tracking.banner.outForDelivery")
      : status === "arrived_delivery"
      ? i18n.t(isRide ? "app.tracking.banner.arrivedAtDestination" : "app.tracking.banner.arrivedAtYourLocation")
      : i18n.t(isHelper ? "app.tracking.banner.helperOnTheWay" : isRide ? "app.tracking.banner.riderOnTheWay" : "app.tracking.banner.headingToPickup");

  return { handleBack, userLocCoords, bannerText };
}
