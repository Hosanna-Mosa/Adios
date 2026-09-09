import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDeliveryStore } from "@/contexts/deliveryStore";

// Part 6 of useHome, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useHomeGetCoords(selectedAddress: any) {
  const getCoords = async () => {
    if (selectedAddress) {
      const lat = selectedAddress.coordinates?.lat ?? selectedAddress.location?.coordinates?.[1];
      const lng = selectedAddress.coordinates?.lng ?? selectedAddress.location?.coordinates?.[0];
      if (lat != null && lng != null) {
        useDeliveryStore.getState().setCurrentCoords({ lat, lng });
        if (selectedAddress.addressLine) {
          useDeliveryStore.getState().setCurrentLocation(selectedAddress.addressLine);
        } else if (selectedAddress.label) {
          useDeliveryStore.getState().setCurrentLocation(selectedAddress.label);
        }
        return { lat, lng };
      }
    }

    try {
      const gpsDeniedBefore = await AsyncStorage.getItem("gps_permission_denied");
      if (gpsDeniedBefore !== "true") {
        let { status } = await Location.getForegroundPermissionsAsync();
        if (status === "undetermined") {
          const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
          status = newStatus;
        }

        if (status === "granted") {
          let loc = null;
          try {
            const locPromise = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            const timeoutPromise = new Promise<any>((_, reject) =>
              setTimeout(() => reject(new Error("Location fetch timeout")), 8000)
            );
            loc = await Promise.race([locPromise, timeoutPromise]);
          } catch (e) {
            console.warn("Home Screen: High accuracy location failed/timed out, trying last known...", e);
            loc = await Location.getLastKnownPositionAsync();
          }

          if (!loc) {
            console.warn("Home Screen: Could not get any location");
            return { lat: null, lng: null };
          }

          const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
          useDeliveryStore.getState().setCurrentCoords(coords);

          try {
            const [address] = await Location.reverseGeocodeAsync({ latitude: coords.lat, longitude: coords.lng });
            if (address) {
              const formatted = [
                address.name, address.street, address.district || address.subregion,
                address.city, address.region, address.postalCode,
              ].filter(Boolean).join(", ");
              useDeliveryStore.getState().setCurrentLocation(formatted);
            }
          } catch (e) {
            console.warn("Home Screen: Reverse geocoding failed:", e);
          }

          return coords;
        } else {
          await AsyncStorage.setItem("gps_permission_denied", "true");
        }
      }
    } catch (error) {
      console.warn("Home Screen: GPS fetch failed:", error);
    }

    return { lat: null, lng: null };
  };

  return { getCoords };
}
