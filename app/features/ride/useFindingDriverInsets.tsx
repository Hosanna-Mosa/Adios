import { useEffect, useState, useMemo } from "react";
import { Alert } from "react-native";
import { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
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
  const styles = useMemo(() => createStyles(tokens, accent, insets), [theme, insets]);

  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmedDriver, setConfirmedDriver] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [onlineDrivers, setOnlineDrivers] = useState<any[]>([]);
  const [orderSummary, setOrderSummary] = useState<{ totalPrice?: number; totalDistance?: number; duration?: number; serviceType?: string }>({});

  const sweep = useSharedValue(0);

  useEffect(() => {
    sweep.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.linear }), -1, false);
  }, [sweep]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sweep.value * 360}deg` }],
  }));

  useEffect(buildFindingDriverInsetsEffect(orderId, isReserved, setBookingConfirmed, setConfirmedDriver, setStops, setOrderSummary), [orderId, isReserved, dateTimeStr]);

  return { insets, orderId, dateTimeStr, tokens, accent, styles, bookingConfirmed, confirmedDriver, stops, onlineDrivers, setOnlineDrivers, orderSummary, spinStyle };
}
