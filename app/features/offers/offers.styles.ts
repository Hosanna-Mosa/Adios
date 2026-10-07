import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/offers.tsx and its components.

export const createOffersStyles = (tokens: ThemeTokens, accent: ServiceTokens) =>
  StyleSheet.create({
    listContent: { paddingHorizontal: 16, paddingTop: 4, gap: 14 },

    card: {
      backgroundColor: tokens.surface, borderRadius: moderateScale(16), borderWidth: 1,
      borderColor: tokens.border, overflow: "hidden",
    },
    vendorRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
    vendorImage: { width: moderateScale(64), height: moderateScale(64), borderRadius: moderateScale(12), backgroundColor: tokens.sunken },
    vendorInfo: { flex: 1, gap: 4 },
    vendorNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    vendorName: { flexShrink: 1, fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.large, lineHeight: typography.lineHeights.large, color: tokens.text },
    vendorMetaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
    ratingPill: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: tokens.successSkin, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 },
    ratingText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: tokens.success },
    vegBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
    vegDot: { width: moderateScale(8), height: moderateScale(8), borderRadius: moderateScale(4), backgroundColor: tokens.veg },
    vegText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.small, color: tokens.veg },
    openText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.small, color: tokens.success },
    closedText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.small, color: tokens.error },
    address: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.sec },

    offerRow: { borderTopWidth: 1, borderTopColor: tokens.border, paddingHorizontal: 12, paddingVertical: 12, gap: 6 },
    offerHead: { flexDirection: "row", alignItems: "center", gap: 8 },
    offerIcon: { width: moderateScale(28), height: moderateScale(28), borderRadius: moderateScale(14), backgroundColor: accent.skin, alignItems: "center", justifyContent: "center" },
    offerTitle: { flex: 1, fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.text },
    offerDiscount: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: accent.accent },
    offerDescription: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.sec },
    offerFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" },
    codeChip: {
      flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderStyle: "dashed",
      borderColor: accent.accent, backgroundColor: accent.skin, borderRadius: moderateScale(8),
      paddingHorizontal: 8, paddingVertical: 3,
    },
    codeText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 0.8, color: accent.accent },
    validity: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.muted },

    stateWrap: { flex: 1, justifyContent: "center" },
  });

export type OffersStyles = ReturnType<typeof createOffersStyles>;
