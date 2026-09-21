import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useDeliveryStore, type SelectedDeliveryAddress } from "@/contexts/deliveryStore";
import { createAddress, updateAddress } from "@/services/users.service";
import { getPlaceDetails } from "@/services/places.service";

// Split out of useAddAddress so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useAddAddressHandleSelectSearchResult(router: any, params: any, mapRef: any, user: any, setUser: any, isEditMode: any, selectedChip: any, label: any, addressLine: any, completeAddress: any, instructions: any, phone: any, receiverName: any, receiverPhone: any, landmark: any, setLoading: any, region: any, setRegion: any, setSearchQuery: any, setSearchResults: any, fetchAddressForCoords: any) {
  const { t } = useTranslation();
  const handleSelectSearchResult = async (item: any) => {
    try {
      const details = Number.isFinite(Number(item.lat)) && Number.isFinite(Number(item.lng))
        ? { lat: Number(item.lat), lng: Number(item.lng) }
        : await getPlaceDetails<any>(item.id);
      const newRegion = { ...region, latitude: details.lat, longitude: details.lng };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
      setSearchQuery("");
      setSearchResults([]);
      await fetchAddressForCoords(details.lat, details.lng);
    } catch (error) {
      console.error("Select place error:", error);
    }
  };

  const handleSave = async () => {
    if (!addressLine.trim()) {
      Alert.alert(t("app.delivery.missingInformation"), t("app.delivery.streetAddressIsRequired"));
      return;
    }
    const receiverPhoneDigits = receiverPhone.replace(/\D/g, "");
    if (receiverPhone.trim() && receiverPhoneDigits.length !== 10) {
      Alert.alert(t("app.delivery.invalidPhone"), t("app.delivery.enterAValid10digitReceiverPhone"));
      return;
    }
    try {
      setLoading(true);
      let finalAddress = addressLine.trim();
      if (completeAddress.trim()) finalAddress += ` [Apt: ${completeAddress.trim()}]`;
      if (instructions.trim()) finalAddress += ` (Instructions: ${instructions.trim()})`;
      const finalLabel = selectedChip === "Other" ? label.trim() || "Other" : selectedChip;
      // The address contact falls back to the receiver's number, then to whatever the
      // address already carried, then to the account holder's — never a fabricated one.
      const finalPhone = receiverPhoneDigits || phone || user?.phone || "";

      const payload = {
        label: finalLabel,
        addressLine: finalAddress,
        phone: finalPhone,
        receiverName: receiverName.trim(),
        receiverPhone: receiverPhoneDigits,
        landmark: landmark.trim(),
        coordinates: { lat: region.latitude, lng: region.longitude },
      };

      const updatedAddresses = isEditMode
        ? await updateAddress(params.editId as string, payload)
        : await createAddress(payload);

      if (user) setUser({ ...user, addresses: updatedAddresses });

      if (isEditMode && !useDeliveryStore.getState().selectedAddress) {
        await useDeliveryStore.getState().hydrateSelectedAddress();
      }
      const list = updatedAddresses || [];
      const saved = isEditMode
        ? list.find((a: any) => String(a._id) === String(params.editId))
        : list[list.length - 1];
      const { selectedAddress, setSelectedAddress } = useDeliveryStore.getState();
      // A brand new address becomes the active one; an edit only re-selects the
      // address that was already active, so editing an unrelated one cannot move
      // the delivery location out from under the customer.
      const shouldSelect = saved && (!isEditMode || String(selectedAddress?._id || "") === String(saved._id));
      if (shouldSelect) {
        const next: SelectedDeliveryAddress = {
          _id: saved._id,
          label: saved.label,
          // The save endpoints always echo addressLine back, but the shared
          // SavedAddress type marks it optional because the list endpoint may
          // omit it. Cast rather than default to "", which would silently
          // replace a missing line with an empty one.
          addressLine: saved.addressLine as string,
          phone: saved.phone,
          receiverName: saved.receiverName,
          receiverPhone: saved.receiverPhone,
          landmark: saved.landmark,
          coordinates: { lat: region.latitude, lng: region.longitude },
          location: { type: "Point", coordinates: [region.longitude, region.latitude] },
        };
        setSelectedAddress(next);
      }

      router.back();
    } catch (error: any) {
      console.error(error);
      Alert.alert(t("actions.error"), error.message || t("app.delivery.failedToSaveAddress"));
    } finally {
      setLoading(false);
    }
  };

  return { handleSelectSearchResult, handleSave };
}
