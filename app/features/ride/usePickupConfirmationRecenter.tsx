import { Alert } from "react-native";
import * as Location from "expo-location";
import { router } from "expo-router";
import { formatGeocodeAddress } from "./usePickupConfirmation.shared";

// Part 3 of usePickupConfirmation, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function usePickupConfirmationRecenter(mapRef: any, params: any, confirmedPickup: any, setConfirmedPickup: any, estimate: any) {
  const recenter = () => {
    mapRef.current?.animateToRegion(
      {
        ...confirmedPickup.coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500,
    );
  };

  const updatePickup = () => {
    router.push({
      pathname: "/ride-searching",
      params: {
        serviceId: params.serviceId,
        rideId: params.rideId,
        rideName: params.rideName,
        ridePrice: estimate ? `₹${estimate.fareBreakdown.total.toFixed(2)}` : params.ridePrice,
        pickupName: confirmedPickup.name,
        pickupLat: confirmedPickup.coords.latitude.toString(),
        pickupLng: confirmedPickup.coords.longitude.toString(),
        dropName: params.dropName,
        dropLat: params.dropLat,
        dropLng: params.dropLng,
        fareTotal: estimate?.fareBreakdown.total.toString() || params.fareTotal,
        estimatedMinutes: estimate?.estimatedMinutes.toString() || params.estimatedMinutes,
        distanceInKm: estimate?.distanceInKm.toString() || params.distanceInKm,
        stops: params.stops,
      },
    });
  };

  const useCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      let locationName = "Current location";
      try {
        const places = await Location.reverseGeocodeAsync(coords);
        if (places[0]) {
          locationName = formatGeocodeAddress(places[0]);
        }
      } catch (error) {
        console.error("Current location reverse geocode error:", error);
      }

      setConfirmedPickup({
        name: locationName,
        coords,
      });

      mapRef.current?.animateToRegion(
        {
          ...coords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500,
      );
    } catch {
      Alert.alert("Error", "Could not fetch current location.");
    }
  };

  return { recenter, updatePickup, useCurrentLocation };
}
