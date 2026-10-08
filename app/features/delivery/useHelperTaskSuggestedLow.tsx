import React from "react";
import { useTranslation } from "react-i18next";
import { usePolling, type IsCurrent } from "@/utils/usePolling";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import * as Location from "expo-location";
import { getOrder } from "@/services/orders.service";
import { showAlert } from "@/components/ui/AppAlert";
import { router } from "expo-router";
import { ASSIGNED_STATUSES, DEAD_STATUSES, STARTED_STATUSES } from "./useHelperTask.shared";

// Split out of useHelperTask so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

/** While looking for a helper. */
const SEARCHING_POLL_MS = 3000;
/** Once assigned, waiting for the helper to start. */
const ASSIGNED_POLL_MS = 5000;

export function useHelperTaskSuggestedLow(setDriver: any, setServiceType: any, step: any, setStep: any, setPickupLocation: any, setPickupCoords: any, setIsPickupValid: any, localOrderId: any, setCurrentTaskPrice: any, setRejectedCount: any, setTotalContacted: any, setStartOtp: any, setAssignedDriver: any, setSearchExhausted: any, calculatedFare: any) {
  const { t } = useTranslation();
  const suggestedLow = Math.round(calculatedFare * 0.85 / 5) * 5;
  const suggestedHigh = Math.round(calculatedFare * 1.15 / 5) * 5;

  const goToAssigned = React.useCallback((driverInfo: any) => {
    if (driverInfo) {
      setDriver(driverInfo);
      setAssignedDriver(driverInfo);
    }
    setServiceType("helper");
    setSearchExhausted(false);
    setStep("assigned");
  }, [setDriver, setAssignedDriver, setServiceType, setSearchExhausted, setStep]);

  // The dispatchExhaustedAt already acted on: a price increase restarts the
  // search, and only a newer exhaustion should flip the screen back.
  const exhaustedAt = React.useRef<string | null>(null);
  const sentToTracking = React.useRef(false);
  React.useEffect(() => {
    sentToTracking.current = false;
  }, [localOrderId]);

  // Searching: driver assigned / no helpers. Assigned: the helper starting the
  // task moves the customer to tracking.
  const pollOrder = React.useCallback(async (isCurrent: IsCurrent) => {
    if (!localOrderId) return;
    const orderData = await getOrder(localOrderId);
    if (!orderData || !isCurrent()) return;

    if (step === "assigned") {
      if (STARTED_STATUSES.includes(orderData.status) && !sentToTracking.current) {
        sentToTracking.current = true;
        router.push("/tracking");
      }
      return;
    }

    setRejectedCount(orderData.declineReasons ? orderData.declineReasons.length : 0);
    setTotalContacted(orderData.totalCandidatesCount || 0);
    if (orderData.customerPrice) setCurrentTaskPrice(orderData.customerPrice);
    else if (orderData.totalPrice) setCurrentTaskPrice(orderData.totalPrice);
    if (orderData.restaurantPickupCode) setStartOtp(orderData.restaurantPickupCode);

    // Both casings: the API writes DRIVER_ASSIGNED and driver_assigned for the
    // same transition, and only the uppercase one used to move the screen on.
    if (ASSIGNED_STATUSES.includes(orderData.status) && orderData.driver) {
      goToAssigned(orderData.driver);
    } else if (DEAD_STATUSES.includes(orderData.status)) {
      setSearchExhausted(true);
    } else if (orderData.dispatchExhaustedAt && orderData.dispatchExhaustedAt !== exhaustedAt.current) {
      // Set by the dispatcher once every candidate has declined or timed out.
      exhaustedAt.current = orderData.dispatchExhaustedAt;
      setSearchExhausted(true);
    }
  }, [step, localOrderId, goToAssigned]);

  const pollMs = !localOrderId ? null : step === "searching" ? SEARCHING_POLL_MS : step === "assigned" ? ASSIGNED_POLL_MS : null;
  const { refresh, refreshing } = usePolling(pollOrder, pollMs);

  const handleUseCurrentLocation = async () => {
    try {
      const storeLocation = useDeliveryStore.getState().currentLocation;
      const storeCoords = useDeliveryStore.getState().currentCoords;
      if (storeLocation && storeCoords?.lat && storeCoords?.lng) {
        setPickupLocation(storeLocation);
        setPickupCoords(storeCoords);
        setIsPickupValid(true);
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showAlert(t("app.delivery.permissionDenied"), t("app.delivery.pleaseEnableLocationServicesToFind"));
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = { lat: location.coords.latitude, lng: location.coords.longitude };
      setPickupCoords(coords);
      const [address] = await Location.reverseGeocodeAsync({ latitude: coords.lat, longitude: coords.lng });
      if (address) {
        const formatted = [address.name, address.street, address.district || address.subregion, address.city, address.region, address.postalCode]
          .filter(Boolean)
          .join(", ");
        setPickupLocation(formatted);
        setIsPickupValid(true);
      }
    } catch (error) {
      console.warn("Helper task: GPS fetch failed:", error);
      showAlert(t("actions.error"), t("app.delivery.couldNotFetchYourCurrentLocation"));
    }
  };

  return { suggestedLow, suggestedHigh, handleUseCurrentLocation, refresh, refreshing };
}
