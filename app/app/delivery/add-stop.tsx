import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { router } from "expo-router";
import { useDeliveryStore, DeliveryItem } from "@/contexts/deliveryStore";
import { useThemeStore } from "@/contexts/themeStore";
import { createStyles } from "@/features/delivery/add-stop.styles";
import { Header } from "@/components/ui/Header";
import { designTokens } from "@/constants/colors";

import { AddStopFooter } from "@/features/delivery/components/AddStopFooter";
import { AddStopSection } from "@/features/delivery/components/AddStopSection";
import { AddStopSection2 } from "@/features/delivery/components/AddStopSection2";
import { AddStopSection3 } from "@/features/delivery/components/AddStopSection3";
import { ScreenShell } from "@/components/ui/ScreenShell";

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;

const getDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDistance = (meters: number) => (meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`);

export default function AddStopScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = tokens.services.delivery;
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);

  const [address, setAddress] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [storeName, setStoreName] = useState("");
  const [items, setItems] = useState<DeliveryItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [nearbySuggestions, setNearbySuggestions] = useState<any[]>([]);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [previewDelta, setPreviewDelta] = useState<{ distanceKm: number; newTotal: number } | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const { addStop, currentCoords, stops, route, price } = useDeliveryStore();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (currentCoords) fetchNearbySuggestions(currentCoords.lat, currentCoords.lng);
  }, [currentCoords]);

  const fetchNearbySuggestions = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`${BACKEND_URL}/places/nearby?lat=${lat}&lng=${lng}&radius=3000`);
      const data = await response.json();
      if (Array.isArray(data)) setNearbySuggestions(data.slice(0, 6));
    } catch (error) {
      console.error("Error fetching nearby suggestions:", error);
    }
  };

  const fetchAutocompleteSuggestions = useCallback((input: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!input.trim() || input.length < 2) {
      setAutocompleteSuggestions([]);
      setShowDropdown(false);
      return;
    }
    debounceTimer.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const latParam = currentCoords ? `&lat=${currentCoords.lat}&lng=${currentCoords.lng}` : "";
        const response = await fetch(`${BACKEND_URL}/places/autocomplete?input=${encodeURIComponent(input)}${latParam}&radius=10000`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setAutocompleteSuggestions(data.slice(0, 6));
          setShowDropdown(data.length > 0);
        }
      } catch (error) {
        console.error("Autocomplete error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  }, [currentCoords]);

  const handleAddressInput = (text: string) => {
    setAddressInput(text);
    if (address && text !== address) { setAddress(""); setCoords(undefined); }
    fetchAutocompleteSuggestions(text);
  };

  const handleSelectSuggestion = async (item: any) => {
    const displayAddress = item.address || item.description || item.name;
    setAddress(displayAddress);
    setAddressInput(displayAddress);
    if (item.lat && item.lng) {
      setCoords({ lat: item.lat, lng: item.lng });
    } else if (item.id) {
      try {
        const response = await fetch(`${BACKEND_URL}/places/details/${item.id}`);
        const data = await response.json();
        if (data.lat && data.lng) setCoords({ lat: data.lat, lng: data.lng });
      } catch (error) {
        console.error("Error fetching place details:", error);
      }
    }
    if (!storeName && item.name) setStoreName(item.name);
    setAutocompleteSuggestions([]);
    setShowDropdown(false);
  };

  // Real fare-delta preview: asks the same routing endpoint what the trip
  // would look like with this stop included, before it's committed.
  useEffect(() => {
    if (!coords || !currentCoords) { setPreviewDelta(null); return; }
    let cancelled = false;
    setIsPreviewing(true);
    (async () => {
      try {
        const hypotheticalStops = [...stops, { id: "preview", address, lat: coords.lat, lng: coords.lng, type: "pickup" }];
        const response = await fetch(`${BACKEND_URL}/routing/optimize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ origin: currentCoords, stops: hypotheticalStops }),
        });
        const data = await response.json();
        if (!cancelled && data.totalDistance != null) {
          const baseFee = 2.0;
          const distanceCost = Math.round(data.totalDistance * 0.6 * 100) / 100;
          const stopCharges = hypotheticalStops.length * 1.5;
          const newTotal = Math.round((baseFee + distanceCost + stopCharges) * 100) / 100;
          setPreviewDelta({ distanceKm: Math.round((data.totalDistance - (route?.totalDistance || 0)) * 10) / 10, newTotal });
        }
      } catch (error) {
        console.error("Preview route failed:", error);
      } finally {
        if (!cancelled) setIsPreviewing(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords?.lat, coords?.lng]);

  const handleAddStop = () => {
    if (!address.trim()) {
      Alert.alert("Required", "Please provide an address for the pickup.");
      return;
    }
    if (items.length === 0) {
      Alert.alert("Items needed", "Please add at least one item to pick up at this location.");
      return;
    }
    addStop(address, storeName || undefined, items, coords?.lat, coords?.lng);
    router.back();
  };

  const addItemToLocal = () => {
    if (!newItemName.trim()) return;
    const item: DeliveryItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      quantity: 1,
      estimatedPrice: newItemPrice.trim() ? Number(newItemPrice) : undefined,
    };
    setItems([...items, item]);
    setNewItemName("");
    setNewItemPrice("");
  };

  const removeItemFromLocal = (id: string) => setItems(items.filter((i) => i.id !== id));

  return (
    <ScreenShell keyboardAvoiding>
      <Header
        title={`Add stop ${stops.length + 1}`}
        onBack={() => router.back()}
        style={{ paddingTop: insets.top + 6, paddingBottom: 10 }}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <AddStopSection
          accent={accent}
          address={address}
          addressInput={addressInput}
          autocompleteSuggestions={autocompleteSuggestions}
          handleAddressInput={handleAddressInput}
          handleSelectSuggestion={handleSelectSuggestion}
          isSearching={isSearching}
          setShowDropdown={setShowDropdown}
          setStoreName={setStoreName}
          showDropdown={showDropdown}
          storeName={storeName}
          styles={styles}
          tokens={tokens}
        />

        <AddStopSection2
          accent={accent}
          addItemToLocal={addItemToLocal}
          items={items}
          newItemName={newItemName}
          newItemPrice={newItemPrice}
          removeItemFromLocal={removeItemFromLocal}
          setNewItemName={setNewItemName}
          setNewItemPrice={setNewItemPrice}
          styles={styles}
          tokens={tokens}
        />

        {nearbySuggestions.length > 0 && (
          <AddStopSection3
            formatDistance={formatDistance}
            getDistanceMeters={getDistanceMeters}
            accent={accent}
            currentCoords={currentCoords}
            handleSelectSuggestion={handleSelectSuggestion}
            nearbySuggestions={nearbySuggestions}
            styles={styles}
          />
        )}
      </ScrollView>

      <AddStopFooter
        address={address}
        handleAddStop={handleAddStop}
        insets={insets}
        isPreviewing={isPreviewing}
        items={items}
        previewDelta={previewDelta}
        price={price}
        route={route}
        styles={styles}
      />
    </ScreenShell>
  );
}
