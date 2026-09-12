import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDeliveryStore, DeliveryItem } from "@/contexts/deliveryStore";
import { useThemeStore } from "@/contexts/themeStore";
import { createStyles } from "./add-stop.styles";
import { designTokens } from "@/constants/colors";
import { BACKEND_URL } from "./useAddStop.shared";

// Split out of useAddStop so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useAddStopInsets() {
  const insets = useSafeAreaInsets();
  const theme = useThemeStore((s) => s.theme);
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
  const addStop = useDeliveryStore((s) => s.addStop);
  const currentCoords = useDeliveryStore((s) => s.currentCoords);
  const stops = useDeliveryStore((s) => s.stops);
  const route = useDeliveryStore((s) => s.route);
  const price = useDeliveryStore((s) => s.price);
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

  return { insets, tokens, accent, styles, address, setAddress, addressInput, setAddressInput, storeName, setStoreName, items, setItems, newItemName, setNewItemName, newItemPrice, setNewItemPrice, coords, setCoords, nearbySuggestions, autocompleteSuggestions, setAutocompleteSuggestions, isSearching, showDropdown, setShowDropdown, previewDelta, setPreviewDelta, isPreviewing, setIsPreviewing, addStop, currentCoords, stops, route, price, fetchAutocompleteSuggestions };
}
