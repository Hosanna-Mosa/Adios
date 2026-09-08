import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Platform } from "react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import Colors, { radius, elevation } from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";
import { SPRING } from "@/motion/presets";

type TabKey = "home" | "earnings" | "profile";

interface DriverTabBarProps {
  active: TabKey;
}

const SIDE_MARGIN = moderateScale(16);
const BOTTOM_GAP = moderateScale(14);
const TOP_CLEARANCE = moderateScale(14);
const TAB_PILL_HEIGHT = moderateScale(62);
const ALL_TAB_KEYS: TabKey[] = ["home", "earnings", "profile"];

/**
 * Total height the floating bar occupies, measured from the very bottom of
 * the screen. Use as a screen's scroll-content bottom padding so the last
 * element never sits under the bar — mirrors app/'s useAppTabBarHeight().
 */
export function useDriverTabBarHeight() {
  const insets = useSafeAreaInsets();
  return insets.bottom + BOTTOM_GAP + TAB_PILL_HEIGHT + TOP_CLEARANCE;
}

const TABS: { key: TabKey; label: string; icon: keyof typeof Feather.glyphMap; route: string }[] = [
  { key: "home", label: "Home", icon: "home", route: "/(tabs)" },
  { key: "earnings", label: "Earnings", icon: "bar-chart-2", route: "/(tabs)/earnings" },
  { key: "profile", label: "Profile", icon: "user", route: "/(tabs)/profile" },
];

/**
 * Floating pill tab bar for the driver app, matching the customer app's
 * AppTabBar treatment (spring-animated sliding indicator, glass blur,
 * haptic feedback on tab press) — adapted for driver/: 3 tabs, no cart card,
 * and driver's flat `Colors` export (no light/dark theme switching here).
 */
export function DriverTabBar({ active }: DriverTabBarProps) {
  const insets = useSafeAreaInsets();

  const [pillWidth, setPillWidth] = React.useState(0);
  const segmentWidth = pillWidth / ALL_TAB_KEYS.length;
  const activeIndex = ALL_TAB_KEYS.indexOf(active);

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

  const handleTabPress = (key: TabKey, route: string) => {
    if (key === active) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <View style={[styles.tabPill, { bottom: insets.bottom + BOTTOM_GAP }]}>
        <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFillObject} />
        <View style={styles.tabRow} onLayout={(e) => setPillWidth(e.nativeEvent.layout.width)}>
          {pillWidth > 0 && (
            <Animated.View style={[styles.indicator, indicatorStyle]}>
              <View style={styles.indicatorPill} />
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
                <Feather
                  name={tab.icon}
                  size={moderateScale(20)}
                  color={isActive ? Colors.brand : Colors.tabInactive}
                />
                <Text style={[styles.tabLabel, isActive && { color: Colors.brand, fontFamily: fontFamilies.body.semibold }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabPill: {
    position: "absolute",
    left: SIDE_MARGIN,
    right: SIDE_MARGIN,
    height: TAB_PILL_HEIGHT,
    borderRadius: radius.pill,
    overflow: "hidden",
    backgroundColor: Platform.OS === "android" ? Colors.surface : `${Colors.surface}E6`,
    borderWidth: 1,
    borderColor: Colors.border,
    ...elevation.lg,
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
    backgroundColor: Colors.brandSkin,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  tabLabel: {
    fontFamily: fontFamilies.body.medium,
    fontSize: moderateScale(10.5),
    color: Colors.tabInactive,
  },
});
