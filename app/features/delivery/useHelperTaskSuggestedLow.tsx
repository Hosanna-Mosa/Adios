import React from "react";
import { Alert } from "react-native";
import { customFetch } from "@/utils/api/custom-fetch";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import * as Location from "expo-location";

// Part 2 of useHelperTask, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useHelperTaskSuggestedLow(setDriver: any, step: any, setStep: any, setPickupLocation: any, setPickupCoords: any, setIsPickupValid: any, localOrderId: any, setCurrentTaskPrice: any, setRejectedCount: any, setTotalContacted: any, setStartOtp: any, setAssignedDriver: any, calculatedFare: any) {
  const suggestedLow = Math.round(calculatedFare * 0.85 / 5) * 5;
  const suggestedHigh = Math.round(calculatedFare * 1.15 / 5) * 5;

  React.useEffect(() => {
    let interval: any;
    if (step === "searching" && localOrderId) {
      const fetchStatus = async () => {
        try {
          const orderData = await customFetch<any>(`/orders/${localOrderId}`);
          if (orderData) {
            setRejectedCount(orderData.declineReasons ? orderData.declineReasons.length : 0);
            setTotalContacted(orderData.totalCandidatesCount || 0);
            if (orderData.customerPrice) setCurrentTaskPrice(orderData.customerPrice);
            else if (orderData.totalPrice) setCurrentTaskPrice(orderData.totalPrice);
            if (orderData.restaurantPickupCode) setStartOtp(orderData.restaurantPickupCode);
            if ((orderData.status === "DRIVER_ASSIGNED" || orderData.status === "accepted") && orderData.driver) {
              setDriver(orderData.driver);
              setAssignedDriver(orderData.driver);
              setStep("assigned");
            }
          }
        } catch (err) {
          console.warn("Error polling order status:", err);
        }
      };
      fetchStatus();
      interval = setInterval(fetchStatus, 3000);
    }
    return () => clearInterval(interval);
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
        Alert.alert("Permission denied", "Please enable location services to find your current location.");
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
      Alert.alert("Error", "Could not fetch your current location. Please type it manually.");
    }
  };

  return { suggestedLow, suggestedHigh, handleUseCurrentLocation };
}
