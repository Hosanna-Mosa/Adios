import React from "react";
import { useLocalSearchParams } from "expo-router";
import MapView from "@/components/maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createStyles } from "./pickup-confirmation.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { FareEstimate } from "./usePickupConfirmation.shared";

// Part 1 of usePickupConfirmation, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function usePickupConfirmationInsets() {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = tokens.services.ride;
  const styles = React.useMemo(() => createStyles(tokens, accent, insets), [theme, insets]);
  const mapRef = React.useRef<MapView>(null);

  const params = useLocalSearchParams<{
    serviceId: string;
    rideId: string;
    rideName: string;
    ridePrice: string;
    pickupName: string;
    dropName: string;
    pickupLat: string;
    pickupLng: string;
    dropLat: string;
    dropLng: string;
    stops?: string;
    estimatedMinutes?: string;
    distanceInKm?: string;
    fareTotal?: string;
  }>();

  const pickupCoords = React.useMemo(
    () => ({
      latitude: parseFloat(params.pickupLat || "0"),
      longitude: parseFloat(params.pickupLng || "0"),
    }),
    [params.pickupLat, params.pickupLng],
  );
  const [confirmedPickup, setConfirmedPickup] = React.useState({
    name: params.pickupName || "Pickup point",
    coords: pickupCoords,
  });

  const [estimate, setEstimate] = React.useState<FareEstimate | null>(() => {
    const total = Number(params.fareTotal);
    const estimatedMinutes = Number(params.estimatedMinutes);
    const distanceInKm = Number(params.distanceInKm);
    if (!Number.isFinite(total) || !total) return null;
    return {
      distanceInKm: Number.isFinite(distanceInKm) ? distanceInKm : 0,
      estimatedMinutes: Number.isFinite(estimatedMinutes) ? estimatedMinutes : 0,
      fareBreakdown: { total },
    };
  });

  return { insets, tokens, accent, styles, mapRef, params, pickupCoords, confirmedPickup, setConfirmedPickup, estimate, setEstimate };
}
