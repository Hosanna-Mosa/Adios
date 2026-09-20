import React, { useState, useRef, useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import MapView from "@/components/maps";
import { createStyles } from "./ride-confirmation.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { ENABLED_TIERS, FareEstimate, isValidCoordinate } from "./useRideConfirmation.shared";
import { estimateFare } from "@/services/orders.service";

// Split out of useRideConfirmation so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useRideConfirmationInsets() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    serviceId: string;
    pickupName: string;
    dropName: string;
    pickupLat: string;
    pickupLng: string;
    dropLat: string;
    dropLng: string;
    stops?: string;
    bookingForType?: string;
    riderContact?: string;
  }>();

  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const accent = tokens.services.ride;
  const styles = useMemo(() => createStyles(tokens, accent, insets), [theme, insets]);

  const [selectedTier, setSelectedTier] = useState<"bike" | "auto">(
    params.serviceId === "auto" ? "auto" : "bike"
  );
  const [tierFares, setTierFares] = useState<Record<string, FareEstimate | null>>({});
  const [loadingFares, setLoadingFares] = useState(false);
  const [booking, setBooking] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reserveDate, setReserveDate] = useState<Date>(new Date());
  const getInitialTimeParts = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    let hourVal = now.getHours();
    const ampmVal = hourVal >= 12 ? "PM" : "AM";
    hourVal = hourVal % 12 || 12;
    let minVal = Math.round(now.getMinutes() / 5) * 5;
    if (minVal >= 60) minVal = 0;
    return { hour: String(hourVal), minute: String(minVal).padStart(2, "0"), ampm: ampmVal };
  };
  const initialTime = useMemo(() => getInitialTimeParts(), []);
  const [reserveHour, setReserveHour] = useState(initialTime.hour);
  const [reserveMinute, setReserveMinute] = useState(initialTime.minute);
  const [reserveAmpm, setReserveAmpm] = useState(initialTime.ampm);

  const [confirmedReservation, setConfirmedReservation] = useState<any>(null);

  const dateOptions = useMemo(() => {
    const arr: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, []);

  const pickupCoords = useMemo(
    () => ({ latitude: parseFloat(params.pickupLat || "0"), longitude: parseFloat(params.pickupLng || "0") }),
    [params.pickupLat, params.pickupLng]
  );
  const dropCoords = useMemo(
    () => ({ latitude: parseFloat(params.dropLat || "0"), longitude: parseFloat(params.dropLng || "0") }),
    [params.dropLat, params.dropLng]
  );

  React.useEffect(() => {
    if (params.serviceId) useDeliveryStore.getState().setServiceType(params.serviceId);
  }, [params.serviceId]);

  React.useEffect(() => {
    const canEstimate = isValidCoordinate(pickupCoords) && isValidCoordinate(dropCoords);
    if (!canEstimate) return;

    const loadFares = async () => {
      setLoadingFares(true);
      try {
        const results = await Promise.all(
          ENABLED_TIERS.map(async (tier) => {
            try {
              const query = new URLSearchParams({
                pickupLat: String(pickupCoords.latitude),
                pickupLng: String(pickupCoords.longitude),
                dropLat: String(dropCoords.latitude),
                dropLng: String(dropCoords.longitude),
                serviceType: tier.id,
              });
              const estimate = await estimateFare<FareEstimate>(query);
              return [tier.id, estimate] as const;
            } catch {
              return [tier.id, null] as const;
            }
          })
        );
        setTierFares(Object.fromEntries(results));
      } finally {
        setLoadingFares(false);
      }
    };

    loadFares();
  }, [pickupCoords.latitude, pickupCoords.longitude, dropCoords.latitude, dropCoords.longitude]);

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [nearbyDrivers, setNearbyDrivers] = useState<any[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const mapRef = useRef<MapView>(null);

  const stops = useMemo(() => {
    if (!params.stops) return [];
    try {
      return JSON.parse(params.stops);
    } catch {
      return [];
    }
  }, [params.stops]);

  return { insets, params, tokens, accent, styles, selectedTier, setSelectedTier, tierFares, loadingFares, booking, setBooking, showDatePicker, setShowDatePicker, reserveDate, setReserveDate, reserveHour, setReserveHour, reserveMinute, setReserveMinute, reserveAmpm, setReserveAmpm, confirmedReservation, setConfirmedReservation, dateOptions, pickupCoords, dropCoords, userLocation, setUserLocation, nearbyDrivers, setNearbyDrivers, mapReady, setMapReady, routeCoordinates, setRouteCoordinates, mapRef, stops };
}
