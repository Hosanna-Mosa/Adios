import { useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { createStyles } from "@/features/ride/tracking.styles";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { useThemeStore } from "@/contexts/themeStore";
import { RIDE_TYPES } from "./useTracking.shared";

// Part 1 of useTracking, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useTrackingStatus() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ orderId?: string }>();
  const {
    status,
    setStatus,
    currentOrderId,
    setOrderId,
    serviceType,
    setServiceType,
    route,
    setRoute,
    stops,
    setStops,
    driver,
    setDriver,
    unreadCount,
    resetDelivery,
  } = useDeliveryStore();

  const { theme } = useThemeStore();
  const tokens = designTokens[theme];

  const isRide = RIDE_TYPES.includes(serviceType?.toLowerCase() || "");
  const isHelper = serviceType?.toLowerCase() === "helper";

  const [vendorName, setVendorName] = useState<string | null>(null);
  const [vendorPartnerType, setVendorPartnerType] = useState<string | null>(null);
  const accentKey: keyof ThemeTokens["services"] = isRide
    ? "ride"
    : isHelper
      ? "task"
      : vendorPartnerType === "meat"
        ? "meat"
        : vendorName
          ? "food"
          : "delivery";
  const accent = tokens.services[accentKey];
  const styles = useMemo(() => createStyles(tokens, accent), [theme, accentKey]);

  const [eta, setEta] = useState(15);

  return { status, setStatus, currentOrderId, setOrderId, setServiceType, route, setRoute, stops, setStops, driver, setDriver, unreadCount, resetDelivery, insets, params, tokens, isRide, isHelper, vendorName, setVendorName, setVendorPartnerType, accent, styles, eta, setEta };
}
