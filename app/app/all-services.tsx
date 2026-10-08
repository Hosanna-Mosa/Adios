import React from "react";
import { StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
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
import type { ServiceCardItem } from "@/features/home/components/AllServicesTierGrid";

type RideTier = {
  id: string;
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  description: string;
};

// Cab tiers stay commented out until pricing/dispatch actually supports
// them end to end — carried over from the previous version of this screen,
// not a new decision made during the redesign.
function useRideTiers(): RideTier[] {
  const { t } = useTranslation();
  return React.useMemo(() => [
    { id: "bike", name: t("app.rideTierNames.bike"), icon: "motorbike", description: t("app.allServices.rideTierDesc.bike") },
    { id: "auto", name: t("app.rideTierNames.auto"), icon: "rickshaw", description: t("app.allServices.rideTierDesc.auto") },
    // { id: "cab-economy", name: t("app.rideTierNames.cab"), icon: "car", description: "4 seats · AC" },
    // { id: "cab-prime", name: t("app.rideTierNames.cabPrime"), icon: "car-side", description: "4 seats · extra boot" },
  ], [t]);
}

export default function AllServicesScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useAppTabBarHeight();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const accent = tokens.services.ride;
  const styles = React.useMemo(() => createStyles(tokens, accent), [theme, accent, tokens]);
  const setServiceType = useDeliveryStore((state) => state.setServiceType);
  const RIDE_TIERS = useRideTiers();
  const { t } = useTranslation();

  const selectTier = (tier: RideTier) => {
    setServiceType(tier.id);
    router.push({ pathname: "/drop-location", params: { serviceId: tier.id, name: tier.name } });
  };

  // Four equal cards: the ride tiers, then Hire a helper and Package delivery.
  const services: ServiceCardItem[] = [
    ...RIDE_TIERS.map((tier) => ({
      id: tier.id,
      name: tier.name,
      icon: tier.icon,
      description: tier.description,
      accent: tokens.services.ride,
      onPress: () => selectTier(tier),
    })),
    {
      id: "helper",
      name: t("app.home.hireAHelper"),
      icon: "hammer-wrench",
      description: t("app.home.from120Hour"),
      accent: tokens.services.task,
      onPress: () => router.push("/helper-task"),
    },
    {
      id: "package-delivery",
      name: t("app.delivery.packageDelivery"),
      icon: "package-variant-closed",
      description: t("app.packageDelivery.serviceCardHint"),
      accent: tokens.services.delivery,
      // Pickup → drop by bike or auto (app/package-delivery). The older multi-stop courier at
      // /delivery/entry is still reached from "Reorder" on past delivery orders.
      onPress: () => router.push("/package-delivery"),
    },
  ];

  return (
    <ScreenShell>
      <AllServicesHeaderRow
        insets={insets}
        styles={styles}
        tokens={tokens}
      />

      <AllServicesBody services={services} styles={styles} tabBarHeight={tabBarHeight} />

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
      borderRadius: moderateScale(20),
    },
    // Fills the card so the whole card is tappable and both cards in a row match heights.
    tierCardTouchable: { flex: 1, padding: 16 },
    tierBadge: {
      position: "absolute", top: 12, right: 12, backgroundColor: tokens.sunken,
      borderRadius: moderateScale(6), paddingHorizontal: 7, paddingVertical: 3,
    },
    tierBadgeText: {
      fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small,
      letterSpacing: 0.5, textTransform: "uppercase", color: tokens.sec,
    },
    tierIconCircle: {
      width: moderateScale(52), height: moderateScale(52), borderRadius: moderateScale(16),
      backgroundColor: accent.skin, alignItems: "center", justifyContent: "center", marginBottom: 14,
    },
    tierName: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, letterSpacing: -0.1, color: tokens.text },
    tierDescription: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 3 },
  });
