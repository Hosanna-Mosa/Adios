import { router, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useDriverStore } from "@/store/driverStore";
import {
  AddAddressButton,
  NoAddressesState,
  SavedAddressCard,
  SavedAddressesHeader,
} from "@/features/profile/components";
import { styles } from "@/features/profile/saved-addresses.styles";
import { API_URL as apiUrl } from "@/utils/apiUrl";

export default function SavedAddressesScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useDriverStore();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${apiUrl}/users/addresses`, { headers });
      const data = await res.json();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch addresses error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = (id: string) => {
    Alert.alert("Delete Address", "Are you sure you want to remove this address?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;
            const res = await fetch(`${apiUrl}/users/addresses/${id}`, {
              method: "DELETE",
              headers,
            });
            const updated = await res.json();
            setAddresses(Array.isArray(updated) ? updated : []);
          } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to delete address");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleEditAddress = (item: any) => {
    const lat = item.location?.coordinates?.[1] ?? item.coordinates?.lat ?? "";
    const lng = item.location?.coordinates?.[0] ?? item.coordinates?.lng ?? "";
    const qs = `editId=${encodeURIComponent(item._id || "")}&label=${encodeURIComponent(item.label || "")}&addressLine=${encodeURIComponent(item.addressLine || "")}&phone=${encodeURIComponent(item.phone || "")}&receiverName=${encodeURIComponent(item.receiverName || "")}&lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`;
    router.push(`/add-address?${qs}`);
  };

  return (
    <View style={styles.root}>
      <SavedAddressesHeader
        title="Saved Addresses"
        paddingTop={insets.top + (Platform.OS === "web" ? 20 : 0)}
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 20 }]}>
        <AddAddressButton onPress={() => router.push("/add-address")} />

        {loading && addresses.length === 0 ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
        ) : (
          <View style={styles.addressList}>
            {addresses.length === 0 ? (
              <NoAddressesState />
            ) : (
              addresses.map((addr: any, idx: number) => (
                <SavedAddressCard
                  key={addr._id}
                  address={addr}
                  index={idx}
                  onEdit={() => handleEditAddress(addr)}
                  onDelete={() => handleDeleteAddress(addr._id)}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
