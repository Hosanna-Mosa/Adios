import { Share } from "react-native";
import { router } from "expo-router";
import * as Location from "expo-location";
import { showAlert } from "@/components/ui/AppAlert";

// Part 4 of useRideConfirmation, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useRideConfirmationGetDisplayName(params: any, setUserLocation: any, mapRef: any, stops: any, pickupIsValid: any, dropIsValid: any, fitTripToMap: any) {
  const getDisplayName = (addr: string) => {
    if (!addr) return "";
    const parts = addr.split(",");
    return parts.length > 1 ? parts[0].trim() : addr.trim();
  };

  const handleShareRoute = async () => {
    try {
      await Share.share({ message: `I'm heading from ${params.pickupName} to ${params.dropName}. Tracking my ride!` });
    } catch (error: any) {
      showAlert("Error", error.message);
    }
  };

  const handleAddStopFromMap = () => {
    router.push({
      pathname: "/drop-location",
      params: {
        serviceId: params.serviceId,
        pickupName: params.pickupName,
        pickupLat: params.pickupLat,
        pickupLng: params.pickupLng,
        dropName: params.dropName,
        dropLat: params.dropLat,
        dropLng: params.dropLng,
        stops: params.stops,
        triggerAddStop: "true",
      },
    });
  };

  const handleRecenter = async () => {
    if (pickupIsValid && dropIsValid) {
      fitTripToMap(true);
    } else {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          setUserLocation(coords);
          mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 1000);
        }
      } catch {}
    }
  };

  return { getDisplayName, handleShareRoute, handleAddStopFromMap, handleRecenter };
}
