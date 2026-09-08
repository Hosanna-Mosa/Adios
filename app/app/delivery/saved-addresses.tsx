import React, { useState, useCallback, useMemo } from "react";
import { ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { router, useFocusEffect } from "expo-router";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { customFetch } from "@/utils/api/custom-fetch";
import { useAuthStore } from "@/contexts/authStore";
import { useDeliveryStore, type SelectedDeliveryAddress } from "@/contexts/deliveryStore";
import { useHomeStore } from "@/contexts/homeStore";
import { createStyles } from "@/features/delivery/saved-addresses.styles";
import { Header } from "@/components/ui/Header";
import { designTokens } from "@/constants/colors";

import { useThemeStore } from "@/contexts/themeStore";

import { SavedAddressesSection } from "@/features/delivery/components/SavedAddressesSection";
import { SavedAddressesSection2 } from "@/features/delivery/components/SavedAddressesSection2";
import { SavedAddressesSection3 } from "@/features/delivery/components/SavedAddressesSection3";
import { SavedAddressesEmptyWrap } from "@/features/delivery/components/SavedAddressesEmptyWrap";
import { ScreenShell } from "@/components/ui/ScreenShell";

const RECENT_LOCATIONS_KEY = "recent_locations";

export default function SavedAddressesScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = tokens.services.delivery;
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);

  const { user, setUser } = useAuthStore();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [recentLocations, setRecentLocations] = useState<any[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [currentLocLoading, setCurrentLocLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
      loadRecentLocations();
      useDeliveryStore.getState().hydrateSelectedAddress();
    }, [])
  );

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await customFetch<any[]>("/users/addresses");
      setAddresses(data || []);
      if (user) setUser({ ...user, addresses: data || [] });
    } catch (err) {
      console.error("Fetch addresses error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentLocations = async () => {
    try {
      setRecentLoading(true);
      const data = await customFetch<any[]>("/users/recent-locations");
      if (Array.isArray(data) && data.length > 0) {
        setRecentLocations(data);
        await AsyncStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(data));
        return;
      }
    } catch (err) {
      console.warn("Failed to fetch recent locations from server, trying cache:", err);
    }
    try {
      const stored = await AsyncStorage.getItem(RECENT_LOCATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setRecentLocations(parsed);
      }
    } catch (err) {
      console.error("Failed to load recent locations from storage:", err);
    } finally {
      setRecentLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (currentLocLoading || selectingId) return;
    try {
      setCurrentLocLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Please enable location services to use current location.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const [place] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      const addressLine = place
        ? [place.name, place.streetNumber, place.street, place.city, place.region].filter(Boolean).join(", ")
        : "Current location";
      router.push({ pathname: "/delivery/add-address", params: { step: "2", addressLine, lat: String(loc.coords.latitude), lng: String(loc.coords.longitude) } });
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to determine current location.");
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

  const handleEditAddress = (item: any) => {
    if (selectingId || deletingId) return;
    const lat = item.location?.coordinates?.[1] ?? item.coordinates?.lat ?? "";
    const lng = item.location?.coordinates?.[0] ?? item.coordinates?.lng ?? "";
    const qs = `editId=${encodeURIComponent(item._id || "")}&label=${encodeURIComponent(item.label || "")}&addressLine=${encodeURIComponent(item.addressLine || "")}&phone=${encodeURIComponent(item.phone || "")}&receiverName=${encodeURIComponent(item.receiverName || "")}&receiverPhone=${encodeURIComponent(item.receiverPhone || "")}&landmark=${encodeURIComponent(item.landmark || "")}&lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`;
    router.push(`/delivery/add-address?${qs}`);
  };

  const handleDeleteAddress = (id: string) => {
    if (selectingId || deletingId) return;
    Alert.alert("Delete address", "Are you sure you want to remove this address?", [
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
            Alert.alert("Error", err.message || "Failed to delete address");
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  const handleMoreOptions = (addr: any) => {
    Alert.alert(addr.label || "Address", undefined, [
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

  return (
    <ScreenShell keyboardAvoiding>
      <Header
        title="Places"
        onBack={() => router.back()}
        backDisabled={selectingId !== null}
        style={{ paddingTop: insets.top + 6, paddingBottom: 10 }}
      />

      {isEmpty ? (
        <SavedAddressesEmptyWrap
          accent={accent}
          addresses={addresses}
          currentLocLoading={currentLocLoading}
          handleUseCurrentLocation={handleUseCurrentLocation}
          styles={styles}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
          <SavedAddressesSection
            accent={accent}
            currentLocLoading={currentLocLoading}
            handleUseCurrentLocation={handleUseCurrentLocation}
            selectingId={selectingId}
            styles={styles}
          />

          <SavedAddressesSection2
            accent={accent}
            addresses={addresses}
            deletingId={deletingId}
            handleMoreOptions={handleMoreOptions}
            handleSelectAddress={handleSelectAddress}
            loading={loading}
            parseInstructions={parseInstructions}
            selectingId={selectingId}
            stripMeta={stripMeta}
            styles={styles}
            tokens={tokens}
          />

          {(recentLoading || recentLocations.length > 0) && (
            <SavedAddressesSection3
              accent={accent}
              handleSelectRecentLocation={handleSelectRecentLocation}
              recentLoading={recentLoading}
              recentLocations={recentLocations}
              selectingId={selectingId}
              styles={styles}
              tokens={tokens}
            />
          )}
        </ScrollView>
      )}
    </ScreenShell>
  );
}
