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
import { buildFindingDriverInsetsEffect } from "./useFindingDriverInsets.effects";

// Split out of useFindingDriver so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useFindingDriverInsets() {
  const insets = useSafeAreaInsets();
  const { orderId, isReserved, dateTimeStr } = useLocalSearchParams<{ orderId: string; isReserved?: string; dateTimeStr?: string }>();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const accent = tokens.services.ride;
  const styles = useMemo(() => createStyles(tokens, accent, insets), [theme, insets]);

  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmedDriver, setConfirmedDriver] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [onlineDrivers, setOnlineDrivers] = useState<any[]>([]);
  const [orderSummary, setOrderSummary] = useState<{ totalPrice?: number; totalDistance?: number; duration?: number; serviceType?: string; hasOutlet?: boolean }>({});

  // Set from each poll of the order (and right after a food order is placed).
  const foodStage = useDeliveryStore((s) => s.foodStage);
  const serviceType = useDeliveryStore((s) => s.serviceType);
  const isRide = ["bike", "auto", "cab", "cab_prime"].includes(String(orderSummary.serviceType || serviceType || "").toLowerCase());

  const sweep = useSharedValue(0);

  useEffect(() => {
    sweep.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.linear }), -1, false);
  }, [sweep]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sweep.value * 360}deg` }],
  }));

  useEffect(buildFindingDriverInsetsEffect(orderId, isReserved, setBookingConfirmed, setConfirmedDriver, setStops, setOrderSummary), [orderId, isReserved, dateTimeStr]);

  return { insets, orderId, dateTimeStr, tokens, accent, styles, bookingConfirmed, confirmedDriver, stops, onlineDrivers, setOnlineDrivers, orderSummary, spinStyle, foodStage, isRide };
}
