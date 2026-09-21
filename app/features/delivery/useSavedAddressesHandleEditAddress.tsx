import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { deleteAddress } from "@/services/users.service";

// Split out of useSavedAddresses so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useSavedAddressesHandleEditAddress(user: any, setUser: any, addresses: any, setAddresses: any, loading: any, selectingId: any, deletingId: any, setDeletingId: any) {
  const { t } = useTranslation();
  const handleEditAddress = (item: any) => {
    if (selectingId || deletingId) return;
    const lat = item.location?.coordinates?.[1] ?? item.coordinates?.lat ?? "";
    const lng = item.location?.coordinates?.[0] ?? item.coordinates?.lng ?? "";
    const qs = `editId=${encodeURIComponent(item._id || "")}&label=${encodeURIComponent(item.label || "")}&addressLine=${encodeURIComponent(item.addressLine || "")}&phone=${encodeURIComponent(item.phone || "")}&receiverName=${encodeURIComponent(item.receiverName || "")}&receiverPhone=${encodeURIComponent(item.receiverPhone || "")}&landmark=${encodeURIComponent(item.landmark || "")}&lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`;
    router.push(`/delivery/add-address?${qs}`);
  };

  const handleDeleteAddress = (id: string) => {
    if (selectingId || deletingId) return;
    Alert.alert(t("app.delivery.deleteAddress"), t("app.delivery.areYouSureRemoveAddress"), [
      { text: t("actions.cancel"), style: "cancel" },
      {
        text: t("app.delivery.deleteWord"),
        style: "destructive",
        onPress: async () => {
          try {
            setDeletingId(id);
            const updatedAddresses = await deleteAddress(id);
            setAddresses(updatedAddresses || []);
            if (user) setUser({ ...user, addresses: updatedAddresses || [] });
            const { selectedAddress, setSelectedAddress } = useDeliveryStore.getState();
            if (String(selectedAddress?._id || "") === String(id)) setSelectedAddress(null);
          } catch (err: any) {
            console.error("Delete error:", err);
            Alert.alert(t("actions.error"), err.message || t("app.delivery.failedToDeleteAddress"));
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  const handleMoreOptions = (addr: any) => {
    Alert.alert(addr.label || t("app.ride.addressFallback"), undefined, [
      { text: t("app.delivery.editWord"), onPress: () => handleEditAddress(addr) },
      { text: t("app.delivery.deleteWord"), style: "destructive", onPress: () => handleDeleteAddress(addr._id) },
      { text: t("actions.cancel"), style: "cancel" },
    ]);
  };

  const parseInstructions = (addressLine: string) => {
    const match = addressLine?.match(/\(Instructions: (.*?)\)/);
    return match ? match[1] : null;
  };
  const stripMeta = (addressLine: string) => (addressLine || "").replace(/\s*\[Apt:.*?\]/, "").replace(/\s*\(Instructions:.*?\)/, "").trim();

  const isEmpty = !loading && addresses.length === 0;

  return { handleMoreOptions, parseInstructions, stripMeta, isEmpty };
}
