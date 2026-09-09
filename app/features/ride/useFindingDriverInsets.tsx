import { useEffect, useState, useMemo } from "react";
import { Alert } from "react-native";
import { Easing, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createStyles } from "./finding-driver.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { socketService } from "@/utils/socketService";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { customFetch } from "@/utils/api/custom-fetch";
import { buildFindingDriverInsetsEffect } from "./useFindingDriverInsets.effects";

// Part 1 of useFindingDriver, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useFindingDriverInsets() {
  const insets = useSafeAreaInsets();
  const { orderId, isReserved, dateTimeStr } = useLocalSearchParams<{ orderId: string; isReserved?: string; dateTimeStr?: string }>();
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = tokens.services.ride;
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);

  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmedDriver, setConfirmedDriver] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [onlineDrivers, setOnlineDrivers] = useState<any[]>([]);
  const [orderSummary, setOrderSummary] = useState<{ totalPrice?: number; totalDistance?: number; duration?: number; serviceType?: string }>({});

  const sweep = useSharedValue(0);
  const ring1 = useSharedValue(0);
  const ring2 = useSharedValue(0);

  useEffect(() => {
    sweep.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.linear }), -1, false);
    // Each ring loops its own [pause, pulse] cycle — ring2's 800ms pause
    // before every pulse is what staggers it relative to ring1.
    ring1.value = withRepeat(withTiming(1, { duration: 2600 }), -1, false);
    ring2.value = withRepeat(withSequence(withTiming(0, { duration: 800 }), withTiming(1, { duration: 2600 })), -1, false);
  }, [sweep, ring1, ring2]);

  const ring1Style = useAnimatedStyle(() => ({
    opacity: interpolate(ring1.value, [0, 1], [0.18, 0]),
    transform: [{ scale: interpolate(ring1.value, [0, 1], [0.3, 1]) }],
  }));
  const ring2Style = useAnimatedStyle(() => ({
    opacity: interpolate(ring2.value, [0, 1], [0.22, 0]),
    transform: [{ scale: interpolate(ring2.value, [0, 1], [0.3, 1]) }],
  }));
  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sweep.value * 360}deg` }],
  }));

  useEffect(buildFindingDriverInsetsEffect(orderId, isReserved, setBookingConfirmed, setConfirmedDriver, setStops, setOrderSummary), [orderId, isReserved, dateTimeStr]);

  return { insets, orderId, dateTimeStr, tokens, accent, styles, bookingConfirmed, confirmedDriver, stops, onlineDrivers, setOnlineDrivers, orderSummary, ring1Style, ring2Style, spinStyle };
}
