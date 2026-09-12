import React, { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { createStyles } from "./drop-location.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useAuthStore } from "@/contexts/authStore";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { RecentPlace } from "./useLocationSelection.shared";

// Split out of useLocationSelection so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useLocationSelectionInsets() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    serviceId: string;
    name: string;
    pickupName?: string;
    pickupLat?: string;
    pickupLng?: string;
    dropName?: string;
    dropLat?: string;
    dropLng?: string;
    stops?: string; // JSON string
    triggerAddStop?: string;
  }>();
  const { serviceId, name } = params;

  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const accent = tokens.services.ride;
  const styles = React.useMemo(() => createStyles(tokens, accent), [theme]);
  const user = useAuthStore((s) => s.user);
  const setServiceType = useDeliveryStore((state) => state.setServiceType);

  useEffect(() => {
    if (serviceId) {
      setServiceType(serviceId);
    }
  }, [serviceId, setServiceType]);

  const [pickup, setPickup] = useState<any>(null);
  const [drop, setDrop] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [showBookingForSheet, setShowBookingForSheet] = useState(false);
  const [bookingFor, setBookingFor] = useState<"myself" | "someone_else">("myself");
  const [someoneContact, setSomeoneContact] = useState("");
  const [recentPlaces, setRecentPlaces] = useState<RecentPlace[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [savingPreference, setSavingPreference] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setIsNavigating(false);
    }, [])
  );

  return { insets, params, serviceId, name, tokens, accent, styles, user, pickup, setPickup, drop, setDrop, stops, setStops, showBookingForSheet, setShowBookingForSheet, bookingFor, setBookingFor, someoneContact, setSomeoneContact, recentPlaces, setRecentPlaces, savedAddresses, setSavedAddresses, savingPreference, setSavingPreference, isNavigating, setIsNavigating };
}
