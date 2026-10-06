import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeBlurView } from "@/components/ui/SafeBlurView";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { moderateScale } from "react-native-size-matters";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useVendorOrders } from "@/queries/orders.queries";
import { needsAction } from "@/utils/orderStatus";
import { SPRING } from "@/motion/presets";
import { BOTTOM_GAP, TAB_PILL_HEIGHT, TOP_CLEARANCE, createStyles } from "./PartnerTabBar.styles";

type IconName = keyof typeof Ionicons.glyphMap;
type TabDef = { label: string; icon: IconName; activeIcon: IconName };

/**
 * The customer app's floating glass pill (AppTabBar), driven by expo-router's
 * Tabs instead of being re-rendered by every screen, so the highlight glides
 * between tabs rather than remounting. The Orders tab carries a badge with the
 * number of orders the kitchen still has to hand over.
 */
export function PartnerTabBar({ state, navigation, descriptors }: BottomTabBarProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const { data: orders } = useVendorOrders();
  const pending = orders?.filter(needsAction).length ?? 0;

  const tabs: Record<string, TabDef> = useMemo(
    () => ({
      index: { label: t("tabs.home"), icon: "grid-outline", activeIcon: "grid" },
      orders: { label: t("tabs.orders"), icon: "receipt-outline", activeIcon: "receipt" },
      menu: { label: t("tabs.menu"), icon: "restaurant-outline", activeIcon: "restaurant" },
      inventory: { label: t("tabs.inventory"), icon: "file-tray-stacked-outline", activeIcon: "file-tray-stacked" },
      account: { label: t("tabs.account"), icon: "person-outline", activeIcon: "person" },
    }),
    [t],
  );

  // Tabs hidden with `href: null` (Menu for meat centres, Inventory for restaurants).
  const visible = state.routes.filter((route) => (descriptors[route.key]?.options.tabBarItemStyle as { display?: string } | undefined)?.display !== "none");
  const activeIndex = Math.max(0, visible.findIndex((route) => route.key === state.routes[state.index]?.key));

  const [rowWidth, setRowWidth] = React.useState(0);
  const segment = visible.length ? (rowWidth - 8) / visible.length : 0;
  const x = useSharedValue(0);
  React.useEffect(() => {
    x.value = withSpring(activeIndex * segment, SPRING);
  }, [activeIndex, segment, x]);
  const indicatorStyle = useAnimatedStyle(() => ({ width: segment, transform: [{ translateX: x.value }] }));

  return (
    <View style={[styles.pill, { bottom: insets.bottom + BOTTOM_GAP }]}>
      <SafeBlurView intensity={90} tint={theme === "dark" ? "dark" : "light"} style={StyleSheet.absoluteFillObject} />
      <View style={styles.row} onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}>
        {rowWidth > 0 ? (
          <Animated.View style={[styles.indicator, indicatorStyle]}>
            <View style={styles.indicatorPill} />
          </Animated.View>
        ) : null}
        {visible.map((route) => {
          const tab = tabs[route.name];
          if (!tab) return null;
          const focused = state.routes[state.index]?.key === route.key;
          const onPress = () => {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              navigation.navigate(route.name, route.params);
            }
          };
          return (
            <TouchableOpacity
              key={route.key}
              style={styles.item}
              activeOpacity={0.7}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={tab.label}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={focused ? tab.activeIcon : tab.icon} size={moderateScale(21)} color={focused ? tokens.brand : tokens.muted} />
                {route.name === "orders" && pending > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{pending > 9 ? "9+" : pending}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.label, focused && styles.labelActive]} numberOfLines={1}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/** Bottom padding a tab screen's scroll content needs so nothing sits under the bar. */
export function usePartnerTabBarHeight() {
  const insets = useSafeAreaInsets();
  return insets.bottom + BOTTOM_GAP + TAB_PILL_HEIGHT + TOP_CLEARANCE;
}
