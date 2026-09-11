import React from "react";
import { Dimensions } from "react-native";
import { interpolate, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useLocalSearchParams } from "expo-router";
import MapView from "@/components/maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { createStyles } from "./ride-searching.styles";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { useThemeStore } from "@/contexts/themeStore";

// Part 1 of useRideSearching, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useRideSearchingInsets() {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeStore();
  const colors = Colors[theme];
  const styles = React.useMemo(() => createStyles(colors, insets), [colors, insets]);
  const { currentOrderId, setOrderId: setCurrentOrderId, setServiceType: setGlobalServiceType, setDriver: setGlobalDriver, setStatus: setGlobalStatus } = useDeliveryStore();
  const mapRef = React.useRef<MapView>(null);

  const animatedProgress = useSharedValue(0);
  const dotOpacity = useSharedValue(1);

  React.useEffect(() => {
    animatedProgress.value = withRepeat(withTiming(1, { duration: 2000 }), -1, false);
  }, [animatedProgress]);

  React.useEffect(() => {
    dotOpacity.value = withRepeat(withSequence(withTiming(0.3, { duration: 800 }), withTiming(1, { duration: 800 })), -1, false);
  }, [dotOpacity]);

  const screenWidth = Dimensions.get("window").width;
  const progressBarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(animatedProgress.value, [0, 1], [-120, screenWidth]) }],
  }));
  const dotStyle = useAnimatedStyle(() => ({ opacity: dotOpacity.value }));

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
    fareTotal?: string;
    estimatedMinutes?: string;
    distanceInKm?: string;
  }>();
  const [tripDetailsVisible, setTripDetailsVisible] = React.useState(false);

  return { colors, styles, currentOrderId, setCurrentOrderId, setGlobalServiceType, setGlobalDriver, setGlobalStatus, mapRef, progressBarStyle, dotStyle, params, tripDetailsVisible, setTripDetailsVisible };
}
