import React, { useState, useEffect, useRef, useMemo } from "react";
import * as Location from "expo-location";
import AppMapView from "@/components/AppMapView";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { createStyles } from "./useMapPicker.shared";

// Part 1 of useMapPicker, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useMapPickerInsets() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    serviceId: string;
    type?: 'pickup' | 'drop';
    pickupName?: string;
    pickupLat?: string;
    pickupLng?: string;
    dropName?: string;
    dropLat?: string;
    dropLng?: string;
  }>();
  const { serviceId, type } = params;
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = tokens.services.ride;
  const styles = useMemo(() => createStyles(tokens, accent, insets), [theme, insets]);

  const [step, setStep] = useState<'pickup' | 'drop'>(type || 'pickup');
  const [region, setRegion] = useState({
    latitude: 17.0052,
    longitude: 81.7778,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [address, setAddress] = useState("Fetching address...");
  const [loading, setLoading] = useState(false);
  const [recentering, setRecentering] = useState(false);
  const mapRef = useRef<React.ElementRef<typeof AppMapView>>(null);

  const latLabel = region.latitude.toFixed(6);
  const lngLabel = region.longitude.toFixed(6);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setRegion((r) => ({ ...r, latitude: location.coords.latitude, longitude: location.coords.longitude }));
      }
    })();
  }, []);

  return { insets, params, serviceId, tokens, accent, styles, step, region, setRegion, address, setAddress, loading, setLoading, recentering, setRecentering, mapRef, latLabel, lngLabel };
}
