import * as Location from "expo-location";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import i18n from "@/i18n";
import { checkZone } from "@/services/places.service";

// Split out of useMapPicker so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useMapPickerHandleRegionChangeComplete(params: any, serviceId: any, step: any, region: any, setRegion: any, address: any, setAddress: any, setLoading: any, setRecentering: any, mapRef: any) {
  const { t } = useTranslation();
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
        setAddress(displayAddr || t("app.delivery.unknownLocation"));
      }
    } catch (error) {
      setAddress(t("app.delivery.errorFetchingAddress"));
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      setRecentering(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("app.delivery.permissionDenied"), t("app.delivery.locationPermissionIsRequired"));
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const nextRegion = { ...region, latitude: location.coords.latitude, longitude: location.coords.longitude };
      mapRef.current?.animateToRegion(nextRegion, 350);
      handleRegionChangeComplete(nextRegion);
    } catch {
      Alert.alert(t("actions.error"), t("app.delivery.couldNotGetCurrentLocation"));
    } finally {
      setRecentering(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const checkRes = await checkZone(region.latitude, region.longitude);
      if (!checkRes || !checkRes.inZone) {
        const stepLabel = step === "pickup" ? i18n.t("app.delivery.pickupWord") : i18n.t("app.delivery.dropWord");
        Alert.alert(t("app.delivery.noService"), t("app.delivery.noServiceAtCurrentVarLocation", { value: stepLabel }));
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
