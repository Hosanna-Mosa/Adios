import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import * as Location from "expo-location";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { MapBackground, MapBackgroundRef } from "@/components/MapBackground";

import { useDeliveryStore } from "@/contexts/deliveryStore";

import { DeliveryEntrySheet } from "@/features/delivery/components/DeliveryEntrySheet";
import { DeliveryEntryHeader } from "@/features/delivery/components/DeliveryEntryHeader";
import { ScreenShell } from "@/components/ui/ScreenShell";

export default function DeliveryEntryScreen() {
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

  const handleStopPress = (stop: any) => {
    if (stop.lat && stop.lng) mapRef.current?.panTo(stop.lat, stop.lng);
  };

  // Live route + fee estimate, recomputed as stops change, so the price is
  // never a reveal at checkout — matches the real /routing/optimize call
  // that used to only fire once, on the final button press.
  useEffect(() => {
    if (stops.length === 0 || !currentCoords) {
      setRoute(null as any);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setIsCalculating(true);
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/routing/optimize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ origin: currentCoords, stops }),
        });
        const data = await response.json();
        if (!cancelled && data.optimizedStops && data.polyline) {
          setStops(data.optimizedStops);
          setRoute({ totalDistance: data.totalDistance, estimatedTime: data.estimatedTime, polyline: data.polyline });
          calculatePrice();
        }
      } catch (error) {
        console.error("Optimization failed:", error);
      } finally {
        if (!cancelled) setIsCalculating(false);
      }
    }, 500);
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops.length, currentCoords?.lat, currentCoords?.lng]);

  const handleReview = () => {
    if (stops.length === 0) return;
    router.push("/delivery/checkout");
  };

  return (
    <ScreenShell>
      <MapBackground ref={mapRef} stops={stops} polyline={route?.polyline} onLocationUpdate={handleLocationUpdate} style={StyleSheet.absoluteFill} />

      <DeliveryEntryHeader
        insets={insets}
        styles={styles}
        tokens={tokens}
      />

      <DeliveryEntrySheet
        accent={accent}
        currentLocation={currentLocation}
        handleRecenter={handleRecenter}
        handleReview={handleReview}
        handleStopPress={handleStopPress}
        insets={insets}
        isCalculating={isCalculating}
        isLocating={isLocating}
        price={price}
        removeStop={removeStop}
        route={route}
        stops={stops}
        styles={styles}
      />
    </ScreenShell>
  );
}

const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["delivery"]) =>
  StyleSheet.create({
    header: { position: "absolute", left: 16, right: 16, zIndex: 10, flexDirection: "row", alignItems: "center", gap: 10 },
    iconBtn: {
      width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center",
    },
    headerTitle: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(15), color: tokens.text, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 9, overflow: "hidden" },
    betaBadge: { backgroundColor: tokens.sunken, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 4 },
    betaBadgeText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(10), letterSpacing: 1, textTransform: "uppercase", color: tokens.sec },

    sheet: {
      position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "72%",
      backgroundColor: tokens.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 12,
      borderTopWidth: 1, borderColor: tokens.border,
    },
    sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: tokens.borderStrong, alignSelf: "center", marginBottom: 16 },

    headline: { fontFamily: fontFamilies.heading.bold, fontSize: moderateScale(24), lineHeight: moderateScale(27), letterSpacing: -0.4, color: tokens.text },
    subhead: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(14), lineHeight: moderateScale(20), color: tokens.sec, marginTop: 8 },

    startCard: {
      flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: tokens.bg, borderWidth: 1, borderColor: tokens.border,
      borderRadius: 16, padding: 14, minHeight: 64, marginTop: 16,
    },
    startIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: accent.skin, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    startLabel: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(10), letterSpacing: 1, textTransform: "uppercase", color: tokens.muted },
    startValue: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(15), color: tokens.text, marginTop: 3 },
    changeLink: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(12), letterSpacing: 0.5, textTransform: "uppercase", color: accent.accent },

    routeSection: { marginTop: 20 },
    sectionLabel: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(11), letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginBottom: 10 },
    addStopBtn: { borderWidth: 1, borderStyle: "dashed", borderColor: accent.accent, backgroundColor: tokens.bg, borderRadius: 14, minHeight: moderateScale(48), alignItems: "center", justifyContent: "center" },
    addStopBtnText: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(14), color: accent.accent },

    footer: { paddingTop: 4, paddingBottom: 14 },
    footerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
    footerMeta: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(14), color: tokens.sec },
    footerPrice: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(15), color: tokens.text },
    reviewBtn: { backgroundColor: accent.accent, borderRadius: 14, minHeight: moderateScale(52), alignItems: "center", justifyContent: "center" },
    reviewBtnText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(15), color: accent.on },
  });
