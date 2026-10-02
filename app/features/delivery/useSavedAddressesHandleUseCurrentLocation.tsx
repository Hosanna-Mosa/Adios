import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import * as Location from "expo-location";
import { useDeliveryStore, type SelectedDeliveryAddress } from "@/contexts/deliveryStore";
import { useHomeStore } from "@/contexts/homeStore";
import { showAlert } from "@/components/ui/AppAlert";

// Split out of useSavedAddresses so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useSavedAddressesHandleUseCurrentLocation(selectingId: any, setSelectingId: any, deletingId: any, currentLocLoading: any, setCurrentLocLoading: any) {
  const { t } = useTranslation();
  const handleUseCurrentLocation = async () => {
    if (currentLocLoading || selectingId) return;
    try {
      setCurrentLocLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showAlert(t("app.delivery.permissionDenied"), t("app.delivery.pleaseEnableLocationServicesToUse"));
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const [place] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      const addressLine = place
        ? [place.name, place.streetNumber, place.street, place.city, place.region].filter(Boolean).join(", ")
        : t("app.delivery.currentLocationFallback");
      router.push({ pathname: "/delivery/add-address", params: { step: "2", addressLine, lat: String(loc.coords.latitude), lng: String(loc.coords.longitude) } });
    } catch (err: any) {
      showAlert(t("actions.error"), err.message || t("app.delivery.failedToDetermineCurrentLocation"));
    } finally {
      setCurrentLocLoading(false);
    }
  };

  const handleSelectRecentLocation = (item: any) => {
    if (selectingId || deletingId) return;
    const fullAddress = item.fullAddress || (item.name && item.address ? `${item.name}, ${item.address}` : item.address || item.name);
    router.push({ pathname: "/delivery/add-address", params: { step: "2", addressLine: fullAddress, lat: String(item.lat), lng: String(item.lng) } });
  };

  const handleSelectAddress = async (addr: any) => {
    if (selectingId || deletingId) return;
    const lat = addr.coordinates?.lat ?? addr.location?.coordinates?.[1] ?? 17.4447;
    const lng = addr.coordinates?.lng ?? addr.location?.coordinates?.[0] ?? 78.3498;
    const addressWithCoords: SelectedDeliveryAddress = {
      _id: addr._id,
      label: addr.label,
      addressLine: addr.addressLine,
      phone: addr.phone,
      receiverName: addr.receiverName,
      receiverPhone: addr.receiverPhone,
      landmark: addr.landmark,
      coordinates: { lat, lng },
      location: { type: "Point", coordinates: [lng, lat] },
    };

    try {
      setSelectingId(addr._id);
      useDeliveryStore.getState().setSelectedAddress(addressWithCoords);
      useDeliveryStore.getState().setCurrentCoords({ lat, lng });
      useDeliveryStore.getState().setCurrentLocation(addr.addressLine || addr.label || "");
      // The home feed refresh is a side effect of the new location — whoever sent us
      // here (checkout, most often) must not wait on a network round trip to get its
      // answer back. fetchHomeData swallows its own errors.
      const activeService = useHomeStore.getState().activeService;
      void useHomeStore.getState().fetchHomeData(lat, lng, activeService);
      router.back();
    } catch (e) {
      console.error("Failed to save active address:", e);
    } finally {
      setSelectingId(null);
    }
  };

  return { handleUseCurrentLocation, handleSelectRecentLocation, handleSelectAddress };
}
