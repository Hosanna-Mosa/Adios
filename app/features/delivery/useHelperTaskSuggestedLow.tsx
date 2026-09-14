import React from "react";
import { customFetch } from "@/utils/api/custom-fetch";
import { socketService } from "@/utils/socketService";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import * as Location from "expo-location";
import { showAlert } from "@/components/ui/AppAlert";
import { router } from "expo-router";
import { ASSIGNED_STATUSES, DEAD_STATUSES, STARTED_STATUSES } from "./useHelperTask.shared";

// Part 2 of useHelperTask, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useHelperTaskSuggestedLow(setDriver: any, setServiceType: any, step: any, setStep: any, setPickupLocation: any, setPickupCoords: any, setIsPickupValid: any, localOrderId: any, setCurrentTaskPrice: any, setRejectedCount: any, setTotalContacted: any, setStartOtp: any, setAssignedDriver: any, setSearchExhausted: any, calculatedFare: any) {
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

  React.useEffect(() => {
    if (step !== "searching" || !localOrderId) return;

    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const orderData = await customFetch<any>(`/orders/${localOrderId}`);
        if (!orderData || cancelled) return;

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
        }
      } catch (err) {
        console.warn("Error polling order status:", err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);

    // Sockets carry the same transitions instantly; the poll above is the safety
    // net. These listeners live with the searching step, so they come down with
    // it — createTask used to attach them and never unsubscribe.
    socketService.trackOrder(localOrderId);
    const onAccepted = (data: any) => goToAssigned(data?.driver);
    const onStatus = (data: any) => {
      if (ASSIGNED_STATUSES.includes(data?.status)) goToAssigned(data?.driver);
      else if (DEAD_STATUSES.includes(data?.status)) setSearchExhausted(true);
    };
    // Emitted by the dispatcher once every candidate has declined or timed out.
    const onNoDrivers = () => setSearchExhausted(true);

    socketService.on("order_accepted", onAccepted);
    socketService.on("order_status_update", onStatus);
    socketService.on("no_drivers_available", onNoDrivers);

    return () => {
      cancelled = true;
      clearInterval(interval);
      socketService.off("order_accepted", onAccepted);
      socketService.off("order_status_update", onStatus);
      socketService.off("no_drivers_available", onNoDrivers);
    };
  }, [step, localOrderId, goToAssigned]);

  React.useEffect(() => {
    if (step !== "assigned" || !localOrderId) return;

    const goToTracking = () => router.push("/tracking");
    const onStatus = (data: any) => {
      if (STARTED_STATUSES.includes(data?.status)) goToTracking();
    };

    socketService.on("task_started", goToTracking);
    socketService.on("order_status_update", onStatus);

    // Polled too, so a customer who had the app backgrounded when the helper
    // started still lands on tracking rather than on a stale panel.
    const interval = setInterval(async () => {
      try {
        const orderData = await customFetch<any>(`/orders/${localOrderId}`);
        if (orderData && STARTED_STATUSES.includes(orderData.status)) goToTracking();
      } catch {
        // A failed poll is not worth surfacing; the socket is the primary path.
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      socketService.off("task_started", goToTracking);
      socketService.off("order_status_update", onStatus);
    };
  }, [step, localOrderId]);

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
        showAlert("Permission denied", "Please enable location services to find your current location.");
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
      showAlert("Error", "Could not fetch your current location. Please type it manually.");
    }
  };

  return { suggestedLow, suggestedHigh, handleUseCurrentLocation };
}
