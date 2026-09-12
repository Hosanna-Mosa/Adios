import { useMemo, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { MapBackgroundRef } from "@/components/MapBackground";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { createStyles } from "./useDeliveryEntry.shared";

// Split out of useDeliveryEntry so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useDeliveryEntryStops() {
  const insets = useSafeAreaInsets();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const accent = tokens.services.delivery;
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);

  const stops = useDeliveryStore((s) => s.stops);
  const route = useDeliveryStore((s) => s.route);
  const price = useDeliveryStore((s) => s.price);
  const currentLocation = useDeliveryStore((s) => s.currentLocation);
  const currentCoords = useDeliveryStore((s) => s.currentCoords);
  const setCurrentLocation = useDeliveryStore((s) => s.setCurrentLocation);
  const setCurrentCoords = useDeliveryStore((s) => s.setCurrentCoords);
  const removeStop = useDeliveryStore((s) => s.removeStop);
  const setStops = useDeliveryStore((s) => s.setStops);
  const setRoute = useDeliveryStore((s) => s.setRoute);
  const calculatePrice = useDeliveryStore((s) => s.calculatePrice);

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
