import * as Location from "expo-location";
import { router } from "expo-router";
import { customFetch } from "@/utils/api/custom-fetch";
import { showAlert } from "@/components/ui/AppAlert";

// Part 2 of useMapPicker, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useMapPickerHandleRegionChangeComplete(params: any, serviceId: any, step: any, region: any, setRegion: any, address: any, setAddress: any, setLoading: any, setRecentering: any, mapRef: any) {
  const handleRegionChangeComplete = async (newRegion: any) => {
    setRegion(newRegion);
    setLoading(true);
    try {
      const geocode = await Location.reverseGeocodeAsync({
        latitude: newRegion.latitude,
        longitude: newRegion.longitude,
      });
      if (geocode.length > 0) {
        const addr = geocode[0];
        const displayAddr = `${addr.name || ''} ${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}`.trim();
        setAddress(displayAddr || "Unknown location");
      }
    } catch (error) {
      setAddress("Error fetching address");
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      setRecentering(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showAlert("Permission denied", "Location permission is required.");
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const nextRegion = { ...region, latitude: location.coords.latitude, longitude: location.coords.longitude };
      mapRef.current?.animateToRegion(nextRegion, 350);
      handleRegionChangeComplete(nextRegion);
    } catch {
      showAlert("Error", "Could not get current location");
    } finally {
      setRecentering(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const checkRes = await customFetch<any>(`/zones/check?lat=${region.latitude}&lng=${region.longitude}`);
      if (!checkRes || !checkRes.inZone) {
        showAlert("No Service", `No service at current ${step} location.`);
        return;
      }
    } catch (err) {
      console.error("Zone check failed:", err);
    } finally {
      setLoading(false);
    }

    const currentData = { name: address, lat: region.latitude, lng: region.longitude };

    if (step === 'pickup') {
      router.push({
        pathname: "/drop-location",
        params: {
          serviceId,
          pickupName: currentData.name,
          pickupLat: currentData.lat.toString(),
          pickupLng: currentData.lng.toString(),
          dropName: params.dropName,
          dropLat: params.dropLat,
          dropLng: params.dropLng,
        }
      });
    } else {
      router.push({
        pathname: "/drop-location",
        params: {
          serviceId,
          pickupName: params.pickupName,
          pickupLat: params.pickupLat,
          pickupLng: params.pickupLng,
          dropName: currentData.name,
          dropLat: currentData.lat.toString(),
          dropLng: currentData.lng.toString(),
        }
      });
    }
  };

  return { handleRegionChangeComplete, handleUseCurrentLocation, handleConfirm };
}
