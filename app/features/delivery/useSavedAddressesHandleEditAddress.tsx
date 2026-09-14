import { router } from "expo-router";
import { customFetch } from "@/utils/api/custom-fetch";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { showAlert } from "@/components/ui/AppAlert";

// Part 3 of useSavedAddresses, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useSavedAddressesHandleEditAddress(user: any, setUser: any, addresses: any, setAddresses: any, loading: any, selectingId: any, deletingId: any, setDeletingId: any) {
  const handleEditAddress = (item: any) => {
    if (selectingId || deletingId) return;
    const lat = item.location?.coordinates?.[1] ?? item.coordinates?.lat ?? "";
    const lng = item.location?.coordinates?.[0] ?? item.coordinates?.lng ?? "";
    const qs = `editId=${encodeURIComponent(item._id || "")}&label=${encodeURIComponent(item.label || "")}&addressLine=${encodeURIComponent(item.addressLine || "")}&phone=${encodeURIComponent(item.phone || "")}&receiverName=${encodeURIComponent(item.receiverName || "")}&receiverPhone=${encodeURIComponent(item.receiverPhone || "")}&landmark=${encodeURIComponent(item.landmark || "")}&lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`;
    router.push(`/delivery/add-address?${qs}`);
  };

  const handleDeleteAddress = (id: string) => {
    if (selectingId || deletingId) return;
    showAlert("Delete address", "Are you sure you want to remove this address?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setDeletingId(id);
            const updatedAddresses = await customFetch<any[]>(`/users/addresses/${id}`, { method: "DELETE" });
            setAddresses(updatedAddresses || []);
            if (user) setUser({ ...user, addresses: updatedAddresses || [] });
            const { selectedAddress, setSelectedAddress } = useDeliveryStore.getState();
            if (String(selectedAddress?._id || "") === String(id)) setSelectedAddress(null);
          } catch (err: any) {
            console.error("Delete error:", err);
            showAlert("Error", err.message || "Failed to delete address");
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  const handleMoreOptions = (addr: any) => {
    showAlert(addr.label || "Address", undefined, [
      { text: "Edit", onPress: () => handleEditAddress(addr) },
      { text: "Delete", style: "destructive", onPress: () => handleDeleteAddress(addr._id) },
      { text: "Cancel", style: "cancel" },
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
