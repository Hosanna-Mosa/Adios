import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Module-level values shared by the parts of useDeliveryEntry.

export const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["delivery"]) =>
  StyleSheet.create({
    header: { position: "absolute", left: 16, right: 16, zIndex: 10, flexDirection: "row", alignItems: "center", gap: 10 },
    iconBtn: {
      width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center",
    },
    headerTitle: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 9, overflow: "hidden" },
    betaBadge: { backgroundColor: tokens.sunken, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 4 },
    betaBadgeText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: tokens.sec },

    sheet: {
      position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "72%",
      backgroundColor: tokens.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 12,
      borderTopWidth: 1, borderColor: tokens.border,
    },
    sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: tokens.borderStrong, alignSelf: "center", marginBottom: 16 },

    headline: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.extraLarge, lineHeight: typography.lineHeights.extraLarge, letterSpacing: -0.4, color: tokens.text },
    subhead: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, marginTop: 8 },

    startCard: {
      flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: tokens.bg, borderWidth: 1, borderColor: tokens.border,
      borderRadius: 16, padding: 14, minHeight: 64, marginTop: 16,
    },
    startIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: accent.skin, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    startLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: tokens.muted },
    startValue: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text, marginTop: 3 },
    changeLink: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 0.5, textTransform: "uppercase", color: accent.accent },

    routeSection: { marginTop: 20 },
    sectionLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginBottom: 10 },
    addStopBtn: { borderWidth: 1, borderStyle: "dashed", borderColor: accent.accent, backgroundColor: tokens.bg, borderRadius: 14, minHeight: moderateScale(48), alignItems: "center", justifyContent: "center" },
    addStopBtnText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: accent.accent },

    footer: { paddingTop: 4, paddingBottom: 14 },
    footerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
    footerMeta: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },
    footerPrice: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    reviewBtn: { backgroundColor: accent.accent, borderRadius: 14, minHeight: moderateScale(52), alignItems: "center", justifyContent: "center" },
    reviewBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on },
  });

/** Exact shape of this screen's stylesheet, for components that take it as a prop. */
export type DeliveryEntryStyles = ReturnType<typeof createStyles>;
