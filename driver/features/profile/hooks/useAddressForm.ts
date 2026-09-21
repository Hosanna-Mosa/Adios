import { useState } from "react";
import { Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useDriverStore } from "@/store/driverStore";
import { API_URL as apiUrl } from "@/utils/apiUrl";
import { usePlaceLookup } from "./usePlaceLookup";

/** Form state, place lookup and save for the add/edit address screen.
 * Lifted out of app/add-address.tsx unchanged. */
export function useAddressForm() {
  const params = useLocalSearchParams();
  const { token } = useDriverStore();

  const isEditMode = !!(params.editId && String(params.editId).length > 0);

  const [label, setLabel] = useState(String(params.label || "Home"));
  const [addressLine, setAddressLine] = useState(String(params.addressLine || ""));
  const [phone, setPhone] = useState(String(params.phone || ""));
  const [receiverName, setReceiverName] = useState(String(params.receiverName || ""));
  const [loading, setLoading] = useState(false);
  const [addressLat, setAddressLat] = useState<number | null>(params.lat ? Number(params.lat) : null);
  const [addressLng, setAddressLng] = useState<number | null>(params.lng ? Number(params.lng) : null);

  const {
    fetchingLoc, suggestions, setSuggestions,
    fetchSuggestions, handleGetCurrentLocation,
  } = usePlaceLookup({ setAddressLine, setAddressLat, setAddressLng });

  const handleSave = async () => {
    if (!addressLine.trim()) {
      Alert.alert("Missing information", "Please enter your address.");
      return;
    }

    try {
      setLoading(true);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const body: any = {
        label,
        addressLine: addressLine.trim(),
      };
      if (phone.trim()) body.phone = phone.trim();
      if (receiverName.trim()) body.receiverName = receiverName.trim();
      if (isEditMode && params.editId) {
        body.editId = String(params.editId);
      }
      if (addressLat !== null && addressLng !== null) {
        body.coordinates = { lat: addressLat, lng: addressLng };
      } else if (params.lat && params.lng) {
        body.coordinates = { lat: Number(params.lat), lng: Number(params.lng) };
      }

      const res = await fetch(`${apiUrl}/users/addresses`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to save address");
      }

      Alert.alert("Success", isEditMode ? "Address updated successfully!" : "Address saved successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save address.");
    } finally {
      setLoading(false);
    }
  };

  return {
    isEditMode,
    label, setLabel,
    addressLine, setAddressLine,
    phone, setPhone,
    receiverName, setReceiverName,
    loading,
    addressLat, setAddressLat,
    addressLng, setAddressLng,
    fetchingLoc,
    suggestions, setSuggestions,
    fetchSuggestions,
    handleGetCurrentLocation,
    handleSave,
  };
}
