import React from "react";
import { StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import Colors from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";
import { SPRING } from "@/motion/presets";
import { BOTTOM_GAP, TAB_PILL_HEIGHT, TOP_CLEARANCE } from "./DriverTabBar.constants";
import { styles } from "./DriverTabBar.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

type TabKey = "home" | "earnings" | "profile";

interface DriverTabBarProps {
  active: TabKey;
}

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

/**
 * Floating pill tab bar for the driver app, matching the customer app's
 * AppTabBar treatment (spring-animated sliding indicator, glass blur,
 * haptic feedback on tab press) — adapted for driver/: 3 tabs, no cart card,
 * and driver's flat `Colors` export (no light/dark theme switching here).
 */
export function DriverTabBar({ active }: DriverTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const TABS: { key: TabKey; label: string; icon: keyof typeof Feather.glyphMap; route: string }[] = [
    { key: "home", label: t("tabs.home"), icon: "home", route: "/(tabs)" },
    { key: "earnings", label: t("tabs.earnings"), icon: "bar-chart-2", route: "/(tabs)/earnings" },
    { key: "profile", label: t("tabs.profile"), icon: "user", route: "/(tabs)/profile" },
  ];

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
    <Box style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <Box style={[styles.tabPill, { bottom: insets.bottom + BOTTOM_GAP }]}>
        <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFillObject} />
        <Box style={styles.tabRow} onLayout={(e) => setPillWidth(e.nativeEvent.layout.width)}>
          {pillWidth > 0 && (
            <AnimatedBox style={[styles.indicator, indicatorStyle]}>
              <Box style={styles.indicatorPill} />
            </AnimatedBox>
          )}

          {TABS.map((tab) => {
            const isActive = tab.key === active;
            return (
              <Touchable
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
                <AppText style={[styles.tabLabel, isActive && { color: Colors.brand, fontFamily: fontFamilies.body.semibold }]}>
                  {tab.label}
                </AppText>
              </Touchable>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
