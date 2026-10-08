import { useCallback, useEffect, useRef } from "react";
import { BackHandler } from "react-native";
import { router, useFocusEffect } from "expo-router";
import i18n from "@/i18n";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { calculateDynamicETA } from "./useTracking.shared";

// Split out of useTracking so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

// Leaving live tracking always lands on Home. A plain back() returned to whatever
// opened tracking, usually the "Finding your rider" screen for an order that
// already has a rider. dismissTo pops the whole flow (checkout, finding-driver,
// tracking) off the stack, so nothing stale is left underneath.
export const goHomeFromTracking = () => router.dismissTo("/(tabs)");

export function useTrackingHandleBack(status: any, currentOrderId: any, stops: any, isRide: any, isHelper: any, eta: any, setEta: any, driverLocation: any, deliveryStop: any, pickupStop: any) {
  const foodStage = useDeliveryStore((s) => s.foodStage);

  // Re-estimated whenever the polled driver position moves, against the leg the
  // ride is on. `eta` is read through a ref so it is not a dependency.
  const etaRef = useRef(eta);
  etaRef.current = eta;
  useEffect(() => {
    if (driverLocation?.lat == null || driverLocation?.lng == null) return;
    const headingToPickup = ["pending", "confirmed", "driver_assigned", "en_route_pickup", "arrived_pickup"]
      .includes(status);
    const activeStop = headingToPickup
      ? pickupStop || stops?.[0]
      : deliveryStop || stops?.[stops.length - 1];
    if (activeStop && activeStop.lat != null && activeStop.lng != null) {
      setEta(calculateDynamicETA({ lat: driverLocation.lat, lng: driverLocation.lng }, { lat: Number(activeStop.lat), lng: Number(activeStop.lng) }, etaRef.current));
    }
  }, [driverLocation?.lat, driverLocation?.lng]);

  useEffect(() => {
    if (!currentOrderId) return;
    const timer = setInterval(() => setEta((prev: any) => Math.max(1, prev - 1)), 30000);
    return () => clearInterval(timer);
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
      ? (isRide ? "Rider has arrived" : isHelper ? "Helper has arrived" : "Arrived at the store")
      : status === "en_route_delivery"
      ? (isRide ? "Trip in progress" : isHelper ? "Task in progress" : "Out for delivery")
      : status === "arrived_delivery"
      ? (isRide ? "Arrived at destination" : "Arrived at your location")
      : (isHelper ? "Helper is on the way" : isRide ? "Rider on the way" : "Heading to pickup");

  return { handleBack, userLocCoords, bannerText };
}
