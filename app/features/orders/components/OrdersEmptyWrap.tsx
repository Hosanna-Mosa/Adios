import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { type OrdersStyles } from "../orders.styles";
import { SERVICE_CHIPS, isChipActive } from "../useOrders.shared";

// What My Orders shows when there is nothing to list. With one service chip selected it
// speaks about that service (picture, "No Food Orders Yet", a button into that service);
// with "All" it is the general first-order message.

interface Props {
  /** Selected service filters; one chip's keys select that service's empty state. */
  serviceFilters: Set<string>;
  /** A search is active and matched nothing. */
  searching?: boolean;
  styles: OrdersStyles;
  tokens: ThemeTokens;
}

type EmptyKind = "food" | "meat" | "ride" | "package" | "helper";

const ART: Record<EmptyKind, number> = {
  food: require("@/assets/images/services/food_3d.png"),
  meat: require("@/assets/images/services/meat_3d.png"),
  ride: require("@/assets/images/services/ride_3d.png"),
  package: require("@/assets/images/services/package_3d.png"),
  helper: require("@/assets/images/services/helper_3d.png"),
};

const ICON: Record<EmptyKind, keyof typeof Ionicons.glyphMap> = {
  food: "restaurant-outline",
  meat: "nutrition-outline",
  ride: "car-outline",
  package: "cube-outline",
  helper: "person-outline",
};

const ROUTE: Record<EmptyKind, string> = {
  food: "/(tabs)",
  meat: "/meat-centers",
  ride: "/ride-home",
  package: "/package-delivery",
  helper: "/helper-task",
};

/** Which single service chip is selected, if exactly one is. */
function selectedKind(filters: Set<string>): EmptyKind | null {
  const chip = SERVICE_CHIPS.find((c) => filters.size === c.keys.length && isChipActive(filters, c.keys));
  if (!chip) return null;
  if (chip.keys.includes("food")) return "food";
  if (chip.keys.includes("meat")) return "meat";
  if (chip.keys.includes("bike")) return "ride";
  if (chip.keys.includes("packageDelivery")) return "package";
  if (chip.keys.includes("helper")) return "helper";
  return null;
}

export function OrdersEmptyWrap({ serviceFilters, searching = false, styles, tokens }: Props) {
  const { t } = useTranslation();
  const kind = searching ? null : selectedKind(serviceFilters);

  const copy: Record<EmptyKind, { title: string; sub: string; cta: string }> = {
    food: {
      title: t("app.orders.empty.foodTitle", "No Food Orders Yet"),
      sub: t("app.orders.empty.foodSub", "When you order food, it will appear here so you can track and manage it easily."),
      cta: t("app.orders.empty.foodCta", "Order Food"),
    },
    meat: {
      title: t("app.orders.empty.meatTitle", "No Meat Orders Yet"),
      sub: t("app.orders.empty.meatSub", "Your meat orders will appear here once you place an order."),
      cta: t("app.orders.empty.meatCta", "Order Meat"),
    },
    ride: {
      title: t("app.orders.empty.rideTitle", "No Rides Yet"),
      sub: t("app.orders.empty.rideSub", "Your ride bookings will appear here once you book a ride."),
      cta: t("app.orders.empty.rideCta", "Book a Ride"),
    },
    package: {
      title: t("app.orders.empty.packageTitle", "No Package Deliveries Yet"),
      sub: t("app.orders.empty.packageSub", "Your package delivery orders will appear here once you send a package."),
      cta: t("app.orders.empty.packageCta", "Send a Package"),
    },
    helper: {
      title: t("app.orders.empty.helperTitle", "No Helper Bookings Yet"),
      sub: t("app.orders.empty.helperSub", "Your helper service bookings will appear here once you hire a helper."),
      cta: t("app.orders.empty.helperCta", "Hire a Helper"),
    },
  };

  if (!kind) {
    return (
      <Animated.View style={styles.emptyWrap} entering={fadeInUp(0)}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name={searching ? "search-outline" : "receipt-outline"} size={moderateScale(28)} color={tokens.brand} />
        </View>
        <Text style={styles.emptyTitle}>{searching ? t("app.orders.noMatches", "No matching orders") : t("app.orders.noOrdersYet")}</Text>
        <Text style={styles.emptySubtitle}>
          {searching ? t("app.orders.noMatchesSub", "Try a different restaurant, item or address.") : t("app.orders.foodMeatRidesHelpersAndCourier")}
        </Text>
        {!searching && (
          <TouchableOpacity style={styles.ctaBtn} onPress={() => router.replace("/(tabs)")} activeOpacity={0.85} accessibilityRole="button">
            <Text style={styles.ctaText}>{t("app.orders.exploreFlavour")}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  }

  const c = copy[kind];
  return (
    <Animated.View style={styles.emptyWrap} entering={fadeInUp(0)}>
      <View style={styles.emptyBlob}>
        <Image source={ART[kind]} style={styles.emptyArt} contentFit="contain" accessibilityIgnoresInvertColors />
        <View style={[styles.sparkBar, { top: 2, right: 16, transform: [{ rotate: "-20deg" }] }]} />
        <View style={[styles.sparkBar, { top: 0, right: 34, transform: [{ rotate: "-55deg" }] }]} />
        <View style={[styles.sparkBar, { top: 14, right: 4, transform: [{ rotate: "15deg" }] }]} />
      </View>
      <Text style={styles.emptyTitle}>{c.title}</Text>
      <Text style={styles.emptySubtitle}>{c.sub}</Text>
      <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push(ROUTE[kind] as any)} activeOpacity={0.85} accessibilityRole="button">
        <Ionicons name={ICON[kind]} size={moderateScale(18)} color={tokens.onBrand} />
        <Text style={styles.ctaText}>{c.cta}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
