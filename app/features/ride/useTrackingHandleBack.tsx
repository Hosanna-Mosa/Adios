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

export function useTrackingHandleBack(status: any, currentOrderId: any, stops: any, isRide: any, isHelper: any, eta: any, setEta: any, driverLocation: any, deliveryStop: any, pickupStop: any, isPackageDelivery = false) {
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
  // A package delivery is a bike/auto order, but the banner talks about a delivery, not a trip.
  const packageBanner =
    status === "arrived_pickup"
      ? i18n.t("app.packageDelivery.banner.partnerArrived")
      : status === "en_route_delivery"
      ? i18n.t("app.packageDelivery.banner.inProgress")
      : status === "arrived_delivery"
      ? i18n.t("app.packageDelivery.banner.arrivedAtDrop")
      : i18n.t("app.packageDelivery.banner.partnerOnTheWay");
  const bannerText = isPackageDelivery
    ? packageBanner
    : foodStage === "awaiting_restaurant"
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
