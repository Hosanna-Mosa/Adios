import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Platform } from "react-native";
import { useTranslation } from "react-i18next";
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
import { createStyles, CART_CARD_HEIGHT, TAB_PILL_HEIGHT } from "./AppTabBar.styles";
import { useAppTabBar } from "./useAppTabBar";
export { useAppTabBarHeight } from "./useAppTabBarHeight";

export type TabKey = "home" | "orders" | "account" | "cart";

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
export const BOTTOM_GAP = moderateScale(14);
export const STACK_GAP = moderateScale(10);
export const TOP_CLEARANCE = moderateScale(14);
export const ALL_TAB_KEYS: TabKey[] = ["home", "orders", "account", "cart"];

/**
 * Total height the floating bar cluster occupies, measured from the very
 * bottom of the screen. Use it as the bottom padding of a screen's scroll
 * content so the last element never sits under the bar.
 */

type TabDef = { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap; route: string };

// Labels moved from a module-level constant into this hook so they can call
// t() — see ADIOS_MULTILINGUAL_DEVELOPMENT_PLAN.md, Section 11 ("Constants
// Migration Strategy"). `key`/`route`/icon names are technical, not language,
// and are untouched.
function useTabs(): TabDef[] {
  const { t } = useTranslation();
  return useMemo(
    () => [
      { key: "home", label: t("tabs.home"), icon: "home-outline", activeIcon: "home", route: "/(tabs)" },
      { key: "orders", label: t("tabs.orders"), icon: "receipt-outline", activeIcon: "receipt", route: "/(tabs)/orders" },
      { key: "account", label: t("tabs.account"), icon: "person-outline", activeIcon: "person", route: "/(tabs)/profile" },
    ],
    [t]
  );
}

/**
 * Floating pill bar shared across the main tabs (Home / Orders / Cart /
 * Account) — a soft, elevated glass capsule instead of a flat full-width
 * strip, with a spring-animated highlight that slides between tabs rather
 * than teleporting. An optional cart summary card floats just above it,
 * matching the same rounded-and-lifted treatment, when the cart has items.
 */
export function AppTabBar({ active, accent, cartVendorName }: AppTabBarProps) {
  const {
  insets, theme, tokens, accentTokens, styles, itemCount, totalPrice, pillWidth, setPillWidth,
  indicatorStyle, handleTabPress
  } = useAppTabBar(active, accent, cartVendorName);
  const TABS = useTabs();
  const { t } = useTranslation();

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
              {t("tabs.cart")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
