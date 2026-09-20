import { useState, useCallback, useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "@/contexts/authStore";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { createStyles } from "./saved-addresses.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { RECENT_LOCATIONS_KEY } from "./useSavedAddresses.shared";
import { getAddresses, getRecentLocations } from "@/services/users.service";

// Split out of useSavedAddresses so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useSavedAddressesInsets() {
  const insets = useSafeAreaInsets();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const accent = tokens.services.delivery;
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);

  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
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
      const data = await getAddresses();
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
      const data = await getRecentLocations();
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

  return { insets, tokens, accent, styles, user, setUser, addresses, setAddresses, loading, selectingId, setSelectingId, deletingId, setDeletingId, recentLocations, recentLoading, currentLocLoading, setCurrentLocLoading };
}
