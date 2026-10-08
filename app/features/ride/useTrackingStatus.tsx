import { useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { createStyles } from "@/features/ride/tracking.styles";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { useThemeStore } from "@/contexts/themeStore";
import { RIDE_TYPES } from "./useTracking.shared";

// Split out of useTracking so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useTrackingStatus() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ orderId?: string }>();
  const status = useDeliveryStore((s) => s.status);
  const setStatus = useDeliveryStore((s) => s.setStatus);
  const currentOrderId = useDeliveryStore((s) => s.currentOrderId);
  const setOrderId = useDeliveryStore((s) => s.setOrderId);
  const serviceType = useDeliveryStore((s) => s.serviceType);
  const setServiceType = useDeliveryStore((s) => s.setServiceType);
  const route = useDeliveryStore((s) => s.route);
  const setRoute = useDeliveryStore((s) => s.setRoute);
  const stops = useDeliveryStore((s) => s.stops);
  const setStops = useDeliveryStore((s) => s.setStops);
  const driver = useDeliveryStore((s) => s.driver);
  const setDriver = useDeliveryStore((s) => s.setDriver);
  const unreadCount = useDeliveryStore((s) => s.unreadCount);
  const resetDelivery = useDeliveryStore((s) => s.resetDelivery);

  const theme = useThemeStore((s) => s.theme);
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

  // Minutes until the driver reaches the next stop. null until there is a real
  // estimate (the order's route time, then the driver's live position).
  const [eta, setEta] = useState<number | null>(null);

  return { status, setStatus, currentOrderId, setOrderId, setServiceType, route, setRoute, stops, setStops, driver, setDriver, unreadCount, resetDelivery, insets, params, tokens, isRide, isHelper, vendorName, setVendorName, setVendorPartnerType, accent, styles, eta, setEta };
}
