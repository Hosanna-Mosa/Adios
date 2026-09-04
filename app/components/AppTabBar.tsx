import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Platform } from "react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { designTokens, radius, elevation, type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { useCartStore } from "@/contexts/cartStore";
import { SPRING } from "@/motion/presets";

type TabKey = "home" | "orders" | "account" | "cart";

interface AppTabBarProps {
  /** Omit on pushed screens that aren't one of the 4 tabs (e.g. All Services) — no tab highlights, but the bar still navigates. */
  active?: TabKey;
  /** Which service accent to tint the active tab / cart row with. Omit on screens with no live service context — falls back to the brand color. */
  accent?: keyof ThemeTokens["services"];
  /** Vendor name shown in the cart row, e.g. "Bawarchi". Falls back to a generic label. */
  cartVendorName?: string;
}

/**
 * The bar floats above the screen with margin on every side, so screens have
 * to reserve space for it themselves. `useAppTabBarHeight()` below reports the
 * exact reserved space (including the floating gaps) instead of screens
 * guessing at a padding that breaks the moment the cart card appears.
 */
const SIDE_MARGIN = moderateScale(16);
const BOTTOM_GAP = moderateScale(14);
const STACK_GAP = moderateScale(10);
const TOP_CLEARANCE = moderateScale(14);
const CART_CARD_HEIGHT = moderateScale(60);
const TAB_PILL_HEIGHT = moderateScale(62);
const ALL_TAB_KEYS: TabKey[] = ["home", "orders", "account", "cart"];

/**
 * Total height the floating bar cluster occupies, measured from the very
 * bottom of the screen. Use it as the bottom padding of a screen's scroll
 * content so the last element never sits under the bar.
 */
export function useAppTabBarHeight() {
  const insets = useSafeAreaInsets();
  const itemCount = useCartStore((s) => s.getItemCount());
  return (
    insets.bottom +
    BOTTOM_GAP +
    TAB_PILL_HEIGHT +
    TOP_CLEARANCE +
    (itemCount > 0 ? CART_CARD_HEIGHT + STACK_GAP : 0)
  );
}

const TABS: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap; route: string }[] = [
  { key: "home", label: "Home", icon: "home-outline", activeIcon: "home", route: "/(tabs)" },
  { key: "orders", label: "Orders", icon: "receipt-outline", activeIcon: "receipt", route: "/(tabs)/orders" },
  { key: "account", label: "Account", icon: "person-outline", activeIcon: "person", route: "/(tabs)/profile" },
];

/**
 * Floating pill bar shared across the main tabs (Home / Orders / Cart /
 * Account) — a soft, elevated glass capsule instead of a flat full-width
 * strip, with a spring-animated highlight that slides between tabs rather
 * than teleporting. An optional cart summary card floats just above it,
 * matching the same rounded-and-lifted treatment, when the cart has items.
 */
export function AppTabBar({ active, accent, cartVendorName }: AppTabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accentTokens: ServiceTokens = accent
    ? tokens.services[accent]
    : { accent: tokens.brand, skin: tokens.brandSkin, on: tokens.onBrand };
  const styles = React.useMemo(() => createStyles(tokens, accentTokens), [theme, accent]);

  const itemCount = useCartStore((s) => s.getItemCount());
  const totalPrice = useCartStore((s) => s.getTotalPrice());

  const [pillWidth, setPillWidth] = React.useState(0);
  const segmentWidth = pillWidth / ALL_TAB_KEYS.length;
  const activeIndex = active ? ALL_TAB_KEYS.indexOf(active) : -1;

  const indicatorX = useSharedValue(0);
  const indicatorOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (activeIndex === -1 || segmentWidth === 0) {
      indicatorOpacity.value = withTiming(0, { duration: 160 });
      return;
    }
    indicatorX.value = withSpring(activeIndex * segmentWidth, SPRING);
    indicatorOpacity.value = withTiming(1, { duration: 160 });
  }, [activeIndex, segmentWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: segmentWidth,
    opacity: indicatorOpacity.value,
    transform: [{ translateX: indicatorX.value }],
  }));

  const handleTabPress = (key: TabKey, routeOrCart: string) => {
    if (key === active) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(routeOrCart as any);
  };

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {itemCount > 0 && (
        <Animated.View
          style={[styles.cartCard, { bottom: insets.bottom + BOTTOM_GAP + TAB_PILL_HEIGHT + STACK_GAP }]}
        >
          <BlurView intensity={90} tint={theme === "dark" ? "dark" : "light"} style={StyleSheet.absoluteFillObject} />
          <TouchableOpacity style={styles.cartRow} activeOpacity={0.85} onPress={() => router.push("/cart")}>
            <View style={styles.cartCountBadge}>
              <Text style={styles.cartCountText}>{itemCount}</Text>
            </View>
            <View style={styles.cartInfo}>
              <Text style={styles.cartPrice}>₹{totalPrice}</Text>
              <Text style={styles.cartMeta} numberOfLines={1}>
                {cartVendorName ? `${cartVendorName} · ` : ""}
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </Text>
            </View>
            <Text style={styles.cartCta}>View cart</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={[styles.tabPill, { bottom: insets.bottom + BOTTOM_GAP }]}>
        <BlurView intensity={90} tint={theme === "dark" ? "dark" : "light"} style={StyleSheet.absoluteFillObject} />
        <View
          style={styles.tabRow}
          onLayout={(e) => setPillWidth(e.nativeEvent.layout.width)}
        >
          {pillWidth > 0 && (
            <Animated.View style={[styles.indicator, indicatorStyle]}>
              <View style={[styles.indicatorPill, { backgroundColor: accentTokens.skin }]} />
            </Animated.View>
          )}

          {TABS.map((tab) => {
            const isActive = tab.key === active;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabItem}
                activeOpacity={0.7}
                onPress={() => handleTabPress(tab.key, tab.route)}
              >
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={moderateScale(21)}
                  color={isActive ? accentTokens.accent : tokens.muted}
                />
                <Text style={[styles.tabLabel, isActive && { color: accentTokens.accent, fontFamily: fontFamilies.body.semibold }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => handleTabPress("cart", "/cart")}
          >
            <View style={styles.cartIconWrap}>
              <Ionicons
                name={active === "cart" ? "bag" : "bag-outline"}
                size={moderateScale(21)}
                color={active === "cart" ? accentTokens.accent : tokens.muted}
              />
              {itemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{itemCount}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabLabel, active === "cart" && { color: accentTokens.accent, fontFamily: fontFamilies.body.semibold }]}>
              Cart
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const createStyles = (tokens: ThemeTokens, accent: ServiceTokens) => StyleSheet.create({
  tabPill: {
    position: "absolute",
    left: SIDE_MARGIN,
    right: SIDE_MARGIN,
    height: TAB_PILL_HEIGHT,
    borderRadius: radius.pill,
    overflow: "hidden",
    backgroundColor: Platform.OS === "android" ? tokens.surface : `${tokens.surface}E6`,
    borderWidth: 1,
    borderColor: tokens.border,
    ...elevation.lg,
  },
  cartCard: {
    position: "absolute",
    left: SIDE_MARGIN,
    right: SIDE_MARGIN,
    height: CART_CARD_HEIGHT,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: Platform.OS === "android" ? tokens.surface : `${tokens.surface}E6`,
    borderWidth: 1,
    borderColor: tokens.border,
    ...elevation.md,
  },
  cartRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
  },
  cartCountBadge: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(10),
    backgroundColor: accent.skin,
    alignItems: "center",
    justifyContent: "center",
  },
  cartCountText: {
    fontFamily: fontFamilies.body.bold,
    fontSize: moderateScale(13),
    color: accent.accent,
  },
  cartInfo: {
    flex: 1,
    minWidth: 0,
  },
  cartPrice: {
    fontFamily: fontFamilies.body.semibold,
    fontSize: moderateScale(14),
    color: tokens.text,
  },
  cartMeta: {
    fontFamily: fontFamilies.body.medium,
    fontSize: moderateScale(12),
    color: tokens.sec,
    marginTop: 1,
  },
  cartCta: {
    fontFamily: fontFamilies.body.bold,
    fontSize: moderateScale(12),
    color: accent.on,
    backgroundColor: accent.accent,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  tabRow: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 4,
  },
  indicator: {
    position: "absolute",
    top: moderateScale(7),
    bottom: moderateScale(7),
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  indicatorPill: {
    width: "82%",
    height: "100%",
    borderRadius: radius.pill,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    position: "relative",
  },
  tabLabel: {
    fontFamily: fontFamilies.body.medium,
    fontSize: moderateScale(10.5),
    color: tokens.muted,
  },
  cartIconWrap: {
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -8,
    minWidth: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
    backgroundColor: accent.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    fontFamily: fontFamilies.body.bold,
    fontSize: moderateScale(9.5),
    color: accent.on,
  },
});
