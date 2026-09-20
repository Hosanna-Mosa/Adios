import React from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { designTokens, type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { AppTabBar, useAppTabBarHeight } from "@/components/AppTabBar";

import { AllServicesHeaderRow } from "@/features/home/components/AllServicesHeaderRow";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { AllServicesBody } from "@/features/home/components/AllServicesBody";

type RideTier = {
  id: string;
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  description: string;
};

// Cab tiers stay commented out until pricing/dispatch actually supports
// them end to end — carried over from the previous version of this screen,
// not a new decision made during the redesign.
const RIDE_TIERS: RideTier[] = [
  { id: "bike", name: "Bike", icon: "motorbike", description: "1 seat · fastest" },
  { id: "auto", name: "Auto", icon: "rickshaw", description: "3 seats · metered" },
  // { id: "cab-economy", name: "Cab Economy", icon: "car", description: "4 seats · AC" },
  // { id: "cab-prime", name: "Cab Prime", icon: "car-side", description: "4 seats · extra boot" },
];

export default function AllServicesScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useAppTabBarHeight();
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = tokens.services.ride;
  const styles = React.useMemo(() => createStyles(tokens, accent), [theme]);
  const setServiceType = useDeliveryStore((state) => state.setServiceType);

  const selectTier = (tier: RideTier) => {
    setServiceType(tier.id);
    router.push({ pathname: "/drop-location", params: { serviceId: tier.id, name: tier.name } });
  };

  return (
    <ScreenShell>
      <AllServicesHeaderRow
        insets={insets}
        styles={styles}
        tokens={tokens}
      />

      <AllServicesBody
        RIDE_TIERS={RIDE_TIERS}
        accent={accent}
        selectTier={selectTier}
        styles={styles}
        tabBarHeight={tabBarHeight}
        tokens={tokens}
      />

      <AppTabBar accent="ride" />
    </ScreenShell>
  );
}

const createStyles = (tokens: ThemeTokens, accent: ServiceTokens) =>
  StyleSheet.create({
    headerRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 8 },
    backBtn: {
      width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center",
    },
    headerTitle: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, color: tokens.text },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 160 },
    headline: {
      fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.extraLarge, lineHeight: typography.lineHeights.extraLarge,
      letterSpacing: -0.6, color: tokens.text, marginTop: 18,
    },
    subhead: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, marginTop: 8 },
    tierGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 20 },
    tierCard: {
      width: "47%", backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border,
      borderRadius: moderateScale(20), padding: 16,
    },
    tierIconCircle: {
      width: moderateScale(52), height: moderateScale(52), borderRadius: moderateScale(16),
      backgroundColor: accent.skin, alignItems: "center", justifyContent: "center", marginBottom: 14,
    },
    tierName: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, letterSpacing: -0.1, color: tokens.text },
    tierDescription: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 3 },
    sectionLabel: {
      fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase",
      color: tokens.muted, marginTop: 28, marginBottom: 12,
    },
    crossPromoList: { gap: 10 },
    crossPromoRow: {
      flexDirection: "row", alignItems: "center", gap: 12, minHeight: moderateScale(56),
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: moderateScale(16), paddingHorizontal: 14, paddingVertical: 12,
    },
    crossPromoIcon: { width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(12), alignItems: "center", justifyContent: "center" },
    crossPromoTextWrap: { flex: 1 },
    crossPromoTitle: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    crossPromoSubtitle: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 2 },
    betaBadge: { backgroundColor: tokens.sunken, borderRadius: moderateScale(5), paddingHorizontal: 7, paddingVertical: 4 },
    betaBadgeText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 0.5, textTransform: "uppercase", color: tokens.sec },
  });
