import { useTranslation } from "react-i18next";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import * as Location from "expo-location";
import { showAlert } from "@/components/ui/AppAlert";
import type { HelperQuote } from "@/services/orders.service";

// Split out of useHelperTask so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.
//
// The suggested range is the server's (helper-quote), not a guess around a
// client-side fare. The searching/assigned sockets and polls live in
// useHelperTaskLiveStatus.

export function useHelperTaskSuggestedLow(quote: HelperQuote | null, setPickupLocation: any, setPickupCoords: any, setIsPickupValid: any) {
  const { t } = useTranslation();
  const suggestedLow = quote?.suggestedLow ?? 0;
  const suggestedHigh = quote?.suggestedHigh ?? 0;

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

  return { suggestedLow, suggestedHigh, handleUseCurrentLocation };
}
