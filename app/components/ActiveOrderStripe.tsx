import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import Animated from "react-native-reanimated";
import { designTokens, radius, elevation, type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { useActiveOrder, type OrderStatus } from "@/contexts/deliveryStore";
import { fadeInUp } from "@/motion/presets";
import { RIDE_TYPES } from "@/features/ride/useTracking.shared";

/**
 * Floats above the tab bar — above the cart card too, if that's also showing —
 * whenever the customer has an order in flight: booked a ride or a helper task
 * (or placed a food/delivery order) and then navigated away before it finished.
 * Without this there was no way back to it once you left its screen, short of
 * restarting the exact booking flow, which is what made placing a second order
 * feel like it was stuck behind the first.
 *
 * Tapping it always goes to /tracking — that screen already renders every phase
 * of every service type correctly, "still finding a match" included (see
 * TrackingFindingWrap), so there's one destination regardless of what the order
 * actually is or how far along it's gotten.
 */
interface Props {
  bottom: number;
}

// i18n keys under app.activeOrderStripe.status — resolved at render time.
const STATUS_LABEL_KEY: Partial<Record<OrderStatus, string>> = {
  pending: "findingAMatch",
  confirmed: "findingAMatch",
  driver_assigned: "confirmedOnTheWay",
  en_route_pickup: "headingToPickup",
  arrived_pickup: "arrivedAtPickup",
  picking_items: "preparingYourOrder",
  en_route_delivery: "inProgress",
  arrived_delivery: "arrived",
};

export function ActiveOrderStripe({ bottom }: Props) {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const { isActive, orderId, serviceType, status, driver } = useActiveOrder();

  const isRide = RIDE_TYPES.includes(String(serviceType).toLowerCase());
  const isHelper = serviceType === "helper";
  const accent = tokens.services[isRide ? "ride" : isHelper ? "task" : "delivery"];
  const styles = React.useMemo(() => createStyles(tokens, accent), [theme, accent]);

  if (!isActive || !orderId) return null;

  const title = isRide
    ? t("app.activeOrderStripe.rideInProgress")
    : isHelper
      ? t("app.activeOrderStripe.taskInProgress")
      : t("app.activeOrderStripe.orderInProgress");
  const statusLabel = t(`app.activeOrderStripe.status.${STATUS_LABEL_KEY[status] || "inProgress"}`);
  const caption = driver?.name ? `${statusLabel} · ${driver.name}` : statusLabel;

  return (
    <Animated.View entering={fadeInUp(0)} style={[styles.card, { bottom }]}>
      <BlurView intensity={90} tint={theme === "dark" ? "dark" : "light"} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.85}
        onPress={() => router.push({ pathname: "/tracking", params: { orderId } })}
      >
        <View style={styles.iconWrap}>
          <Ionicons name={isRide ? "car-sport" : isHelper ? "construct" : "cube"} size={moderateScale(18)} color={accent.accent} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.caption} numberOfLines={1}>{caption}</Text>
        </View>
        <Text style={styles.cta}>{t("app.activeOrderStripe.track")}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const SIDE_MARGIN = moderateScale(16);
export const ORDER_STRIPE_HEIGHT = moderateScale(60);

const createStyles = (tokens: ThemeTokens, accent: ServiceTokens) =>
  StyleSheet.create({
    card: {
      position: "absolute",
      left: SIDE_MARGIN,
      right: SIDE_MARGIN,
      height: ORDER_STRIPE_HEIGHT,
      borderRadius: radius.lg,
      overflow: "hidden",
      backgroundColor: Platform.OS === "android" ? tokens.surface : `${tokens.surface}E6`,
      borderWidth: 1,
      borderColor: tokens.border,
      ...elevation.md,
    },
    row: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 14,
    },
    iconWrap: {
      width: moderateScale(32),
      height: moderateScale(32),
      borderRadius: moderateScale(10),
      backgroundColor: accent.skin,
      alignItems: "center",
      justifyContent: "center",
    },
    info: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontFamily: fontFamilies.body.semibold,
      fontSize: typography.sizes.medium,
      color: tokens.text,
    },
    caption: {
      fontFamily: fontFamilies.body.medium,
      fontSize: typography.sizes.small,
      color: tokens.sec,
      marginTop: 1,
    },
    cta: {
      fontFamily: fontFamilies.body.bold,
      fontSize: typography.sizes.small,
      color: accent.on,
      backgroundColor: accent.accent,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: radius.pill,
      overflow: "hidden",
    },
  });
