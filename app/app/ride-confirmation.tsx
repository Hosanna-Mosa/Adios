import React, { useState, useRef, useMemo } from "react";
import { Text, TouchableOpacity, Platform, Share, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { router, useLocalSearchParams } from "expo-router";

import Animated from "react-native-reanimated";
import MapView from "@/components/maps";
import * as Location from "expo-location";
import { RideMapPanel } from "@/features/ride/components/RideMapPanel";
import { TripChooserSheet } from "@/features/ride/components/TripChooserSheet";
import { SchedulePickerSheet } from "@/features/ride/components/SchedulePickerSheet";
import { createStyles } from "@/features/ride/ride-confirmation.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { customFetch } from "@/utils/api/custom-fetch";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { fadeInUp } from "@/motion/presets";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { RideConfirmBody } from "@/features/ride/components/RideConfirmBody";
import { RideConfirmFooterActions } from "@/features/ride/components/RideConfirmFooterActions";

const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const VEHICLE_BIKE_3D = require("@/assets/images/services/scooter_blue_top_view_2.png");
const VEHICLE_AUTO_3D = require("@/assets/images/services/auto_top_view.png");

const isValidCoordinate = (coordinate: { latitude: number; longitude: number }) =>
  Number.isFinite(coordinate.latitude) &&
  Number.isFinite(coordinate.longitude) &&
  Math.abs(coordinate.latitude) <= 90 &&
  Math.abs(coordinate.longitude) <= 180 &&
  !(coordinate.latitude === 0 && coordinate.longitude === 0);

// Only Bike and Auto are enabled anywhere in the app today (All Services
// keeps Cab Economy/Prime commented out — a pre-existing decision, not one
// made during this redesign), so those are the only two tiers this screen
// can honestly compare fares for.
const ENABLED_TIERS: { id: "bike" | "auto"; name: string; icon: string; capacity: string }[] = [
  { id: "bike", name: "Bike", icon: "🏍", capacity: "1 seat" },
  { id: "auto", name: "Auto", icon: "🛺", capacity: "3 seats" },
];

type FareEstimate = { distanceInKm: number; estimatedMinutes: number; fareBreakdown: { total: number } };
type RouteOptimizeResponse = { polyline?: string };

export default function RideConfirmationScreen() {
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

  const { theme } = useThemeStore();
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
              const estimate = await customFetch<FareEstimate>(`/orders/estimate-fare?${query}`, { responseType: "json" });
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

  const validStops = useMemo(
    () =>
      stops
        .map((stop: any) => ({ ...stop, latitude: Number(stop.lat), longitude: Number(stop.lng) }))
        .filter((stop: any) => isValidCoordinate({ latitude: stop.latitude, longitude: stop.longitude })),
    [stops]
  );

  const pickupIsValid = isValidCoordinate(pickupCoords);
  const dropIsValid = isValidCoordinate(dropCoords);
  const tripCoordinates = useMemo(() => {
    if (!pickupIsValid || !dropIsValid) return [];
    return [pickupCoords, ...validStops.map((s: any) => ({ latitude: s.latitude, longitude: s.longitude })), dropCoords];
  }, [pickupIsValid, dropIsValid, pickupCoords, dropCoords, validStops]);

  const fitTripToMap = React.useCallback(
    (animated = true) => {
      if (!mapRef.current || !pickupIsValid || !dropIsValid) return;
      const pointsToFit = [pickupCoords, ...validStops.map((s: any) => ({ latitude: s.latitude, longitude: s.longitude })), dropCoords];
      if (pointsToFit.length < 2) return;
      mapRef.current.fitToCoordinates(pointsToFit, {
        edgePadding: { top: Platform.OS === "ios" ? 110 : 90, right: 60, bottom: 60, left: 60 },
        animated,
      });
    },
    [pickupCoords, dropCoords, validStops, pickupIsValid, dropIsValid]
  );

  const initialRegion = useMemo(() => {
    if (!pickupIsValid && !dropIsValid) return { latitude: 17.0005, longitude: 81.78, latitudeDelta: 0.05, longitudeDelta: 0.05 };
    if (!dropIsValid) return { ...pickupCoords, latitudeDelta: 0.04, longitudeDelta: 0.04 };
    if (!pickupIsValid) return { ...dropCoords, latitudeDelta: 0.04, longitudeDelta: 0.04 };
    const minLat = Math.min(pickupCoords.latitude, dropCoords.latitude);
    const maxLat = Math.max(pickupCoords.latitude, dropCoords.latitude);
    const minLng = Math.min(pickupCoords.longitude, dropCoords.longitude);
    const maxLng = Math.max(pickupCoords.longitude, dropCoords.longitude);
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latDelta = Math.max((maxLat - minLat) * 1.8, 0.025);
    const lngDelta = Math.max((maxLng - minLng) * 1.8, 0.025);
    return { latitude: centerLat - latDelta * 0.18, longitude: centerLng, latitudeDelta: latDelta, longitudeDelta: lngDelta };
  }, [pickupCoords, dropCoords, pickupIsValid, dropIsValid]);

  React.useEffect(() => {
    if (!mapReady || !pickupIsValid || !dropIsValid) return;
    fitTripToMap(false);
    const t1 = setTimeout(() => fitTripToMap(true), 250);
    const t2 = setTimeout(() => fitTripToMap(true), 750);
    const t3 = setTimeout(() => fitTripToMap(true), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [fitTripToMap, mapReady, pickupIsValid, dropIsValid]);

  React.useEffect(() => {
    if (!pickupIsValid || !dropIsValid) { setRouteCoordinates([]); return; }
    let cancelled = false;
    const loadBackendRoute = async () => {
      try {
        const route = await customFetch<RouteOptimizeResponse>("/routing/optimize", {
          method: "POST",
          body: JSON.stringify({
            origin: { latitude: pickupCoords.latitude, longitude: pickupCoords.longitude },
            stops: [
              ...validStops.map((s: any) => ({ id: s.id, address: s.name || s.address || "Stop", latitude: s.latitude, longitude: s.longitude, type: "stop" })),
              { id: "drop", address: params.dropName || "Drop", latitude: dropCoords.latitude, longitude: dropCoords.longitude, type: "drop" },
            ],
          }),
          responseType: "json",
        });
        const decoded = route?.polyline ? decodePolyline(route.polyline) : [];
        if (!cancelled) setRouteCoordinates(decoded.length > tripCoordinates.length ? decoded : []);
      } catch (error) {
        console.warn("Backend route fetch failed:", error);
        if (!cancelled) setRouteCoordinates([]);
      }
    };
    loadBackendRoute();
    return () => { cancelled = true; };
  }, [pickupIsValid, dropIsValid, pickupCoords.latitude, pickupCoords.longitude, dropCoords.latitude, dropCoords.longitude, params.dropName, validStops, tripCoordinates.length]);

  React.useEffect(() => {
    const loadNearbyDrivers = async () => {
      if (!Number.isFinite(pickupCoords.latitude) || !Number.isFinite(pickupCoords.longitude)) return;
      try {
        const drivers = await customFetch<any[]>(
          `/drivers/nearby?latitude=${pickupCoords.latitude}&longitude=${pickupCoords.longitude}&radius=50000`,
          { responseType: "json" }
        );
        const mapped = (drivers || [])
          .map((driver: any) => ({
            id: driver._id || driver.id,
            vehicleType: driver.vehicleType || selectedTier,
            lat: driver.currentLocation?.coordinates?.[1] || driver.user?.addresses?.[0]?.location?.coordinates?.[1],
            lng: driver.currentLocation?.coordinates?.[0] || driver.user?.addresses?.[0]?.location?.coordinates?.[0],
          }))
          .filter((d: any) => Number.isFinite(d.lat) && Number.isFinite(d.lng));
        setNearbyDrivers(mapped);
      } catch (error) {
        console.warn("Unable to load nearby online drivers", error);
      }
    };
    loadNearbyDrivers();
    const interval = setInterval(loadNearbyDrivers, 12000);
    return () => clearInterval(interval);
  }, [pickupCoords.latitude, pickupCoords.longitude, selectedTier]);

  const getDisplayName = (addr: string) => {
    if (!addr) return "";
    const parts = addr.split(",");
    return parts.length > 1 ? parts[0].trim() : addr.trim();
  };

  const handleShareRoute = async () => {
    try {
      await Share.share({ message: `I'm heading from ${params.pickupName} to ${params.dropName}. Tracking my ride!` });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleAddStopFromMap = () => {
    router.push({
      pathname: "/drop-location",
      params: {
        serviceId: params.serviceId,
        pickupName: params.pickupName,
        pickupLat: params.pickupLat,
        pickupLng: params.pickupLng,
        dropName: params.dropName,
        dropLat: params.dropLat,
        dropLng: params.dropLng,
        stops: params.stops,
        triggerAddStop: "true",
      },
    });
  };

  const handleRecenter = async () => {
    if (pickupIsValid && dropIsValid) {
      fitTripToMap(true);
    } else {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          setUserLocation(coords);
          mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 1000);
        }
      } catch {}
    }
  };

  const placeOrder = async (isReserved: boolean, reservedAt?: Date) => {
    setBooking(true);
    try {
      const orderStops = [
        { address: params.pickupName, latitude: pickupCoords.latitude, longitude: pickupCoords.longitude, type: "pickup" },
        ...stops.map((s: any) => ({ address: s.name, latitude: s.lat, longitude: s.lng, type: "stop" })),
        { address: params.dropName, latitude: dropCoords.latitude, longitude: dropCoords.longitude, type: "drop" },
      ];
      const res = await customFetch<{ _id: string }>("/orders", {
        method: "POST",
        body: JSON.stringify({
          stops: orderStops,
          serviceType: selectedTier,
          isReserved,
          reservedAt: isReserved ? reservedAt?.toISOString() : undefined,
          bookingFor: {
            type: params.bookingForType === "someone_else" ? "someone_else" : "myself",
            contactNumber: params.bookingForType === "someone_else" ? params.riderContact : undefined,
          },
        }),
      });

      if (isReserved) {
        setShowDatePicker(false);
        setConfirmedReservation({
          tierName: ENABLED_TIERS.find((t) => t.id === selectedTier)?.name,
          dateTimeStr: reservedAt?.toLocaleString([], { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
          timeStr: reservedAt?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          fare: tierFares[selectedTier]?.fareBreakdown?.total,
          pickupName: params.pickupName,
          dropName: params.dropName,
        });
      } else {
        router.push({ pathname: "/finding-driver", params: { orderId: res._id } });
      }
    } catch (e: any) {
      Alert.alert("Booking failed", e.message);
    } finally {
      setBooking(false);
    }
  };

  if (confirmedReservation) {
    return (
      <ScreenShell>
        <RideConfirmBody
          confirmedReservation={confirmedReservation}
          getDisplayName={getDisplayName}
          insets={insets}
          styles={styles}
        />

        <Animated.View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]} entering={fadeInUp(160)}>
          <RideConfirmFooterActions
            styles={styles}
          />
          <TouchableOpacity style={styles.footerSecondaryBtn} onPress={() => router.replace("/(tabs)")}>
            <Text style={styles.footerSecondaryBtnText}>Back to home</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScreenShell>
    );
  }

  const selectedFare = tierFares[selectedTier];

  return (
    <ScreenShell>
      <RideMapPanel
        VEHICLE_AUTO_3D={VEHICLE_AUTO_3D}
        VEHICLE_BIKE_3D={VEHICLE_BIKE_3D}
        GOOGLE_MAPS_APIKEY={GOOGLE_MAPS_APIKEY}
        dropCoords={dropCoords}
        dropIsValid={dropIsValid}
        fitTripToMap={fitTripToMap}
        getDisplayName={getDisplayName}
        handleAddStopFromMap={handleAddStopFromMap}
        handleRecenter={handleRecenter}
        handleShareRoute={handleShareRoute}
        initialRegion={initialRegion}
        insets={insets}
        mapRef={mapRef}
        nearbyDrivers={nearbyDrivers}
        params={params}
        pickupCoords={pickupCoords}
        pickupIsValid={pickupIsValid}
        routeCoordinates={routeCoordinates}
        selectedFare={selectedFare}
        selectedTier={selectedTier}
        setMapReady={setMapReady}
        styles={styles}
        tokens={tokens}
        tripCoordinates={tripCoordinates}
        userLocation={userLocation}
        validStops={validStops}
      />

      <TripChooserSheet
        ENABLED_TIERS={ENABLED_TIERS}
        accent={accent}
        booking={booking}
        handleAddStopFromMap={handleAddStopFromMap}
        insets={insets}
        loadingFares={loadingFares}
        placeOrder={placeOrder}
        selectedFare={selectedFare}
        selectedTier={selectedTier}
        setSelectedTier={setSelectedTier}
        setShowDatePicker={setShowDatePicker}
        styles={styles}
        tierFares={tierFares}
        tokens={tokens}
      />

      <SchedulePickerSheet
        ENABLED_TIERS={ENABLED_TIERS}
        accent={accent}
        booking={booking}
        dateOptions={dateOptions}
        insets={insets}
        placeOrder={placeOrder}
        reserveAmpm={reserveAmpm}
        reserveDate={reserveDate}
        reserveHour={reserveHour}
        reserveMinute={reserveMinute}
        selectedFare={selectedFare}
        selectedTier={selectedTier}
        setReserveAmpm={setReserveAmpm}
        setReserveDate={setReserveDate}
        setReserveHour={setReserveHour}
        setReserveMinute={setReserveMinute}
        setShowDatePicker={setShowDatePicker}
        showDatePicker={showDatePicker}
        styles={styles}
      />
    </ScreenShell>
  );
}

function decodePolyline(encoded: string) {
  const points: Array<{ latitude: number; longitude: number }> = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let shift = 0, result = 0, byte = 0;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20 && index < encoded.length);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20 && index < encoded.length);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}
