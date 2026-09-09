import { useMemo, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { MapBackgroundRef } from "@/components/MapBackground";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { createStyles } from "./useDeliveryEntry.shared";

// Part 1 of useDeliveryEntry, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useDeliveryEntryStops() {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = tokens.services.delivery;
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);

  const {
    stops, route, price, currentLocation, currentCoords,
    setCurrentLocation, setCurrentCoords, removeStop, setStops, setRoute, calculatePrice,
  } = useDeliveryStore();

  const [isCalculating, setIsCalculating] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef<MapBackgroundRef>(null);

  const handleLocationUpdate = async (coords: { lat: number; lng: number }) => {
    setCurrentCoords(coords);
    try {
      const [place] = await Location.reverseGeocodeAsync({ latitude: coords.lat, longitude: coords.lng });
      if (place) {
        const address = `${place.name || place.streetNumber || ""} ${place.street || ""}, ${place.city || ""}`.trim();
        setCurrentLocation(address || "Current location");
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
  };

  const handleRecenter = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        await handleLocationUpdate({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        mapRef.current?.recenter();
      }
    } catch (error) {
      console.error("Recenter failed:", error);
    } finally {
      setIsLocating(false);
    }
  };

  return { stops, route, price, currentLocation, currentCoords, removeStop, setStops, setRoute, calculatePrice, insets, tokens, accent, styles, isCalculating, setIsCalculating, isLocating, mapRef, handleLocationUpdate, handleRecenter };
}
