import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/payment.tsx (the food Payment options screen). Card, label and button
// shapes match checkout.styles.ts so the two screens read as one flow.

export const createStyles = (tokens: ThemeTokens, accent: ServiceTokens) =>
  StyleSheet.create({
    content: { paddingHorizontal: 16, paddingTop: 4 },
    section: { marginTop: 22 },
    sectionLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginBottom: 12 },

    summaryCard: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 18, padding: 16 },
    summaryHead: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12,
      paddingBottom: 12, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: tokens.border,
    },
    summaryItems: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },
    summaryTotal: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.large, color: tokens.text },

    routeRow: { flexDirection: "row", gap: 12 },
    routeRail: { alignItems: "center", width: 12, paddingVertical: 4 },
    routeDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2.5, borderColor: accent.accent, backgroundColor: tokens.surface },
    routeLine: { flex: 1, width: 2, minHeight: 14, marginVertical: 3, borderRadius: 1, backgroundColor: accent.skin },
    routeStops: { flex: 1, minWidth: 0, gap: 14 },
    routeTitle: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    routeSub: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, marginTop: 2 },

    optionList: { gap: 12 },
    optionCard: { backgroundColor: tokens.surface, borderWidth: 1.5, borderColor: tokens.border, borderRadius: 18, padding: 14 },
    optionCardActive: { borderColor: accent.accent },
    optionRow: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48 },
    optionIcon: {
      width: moderateScale(44), height: moderateScale(44), borderRadius: 12, backgroundColor: tokens.sunken,
      borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    optionIconActive: { backgroundColor: accent.skin, borderColor: accent.skin },
    optionText: { flex: 1, minWidth: 0 },
    optionTitle: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    optionHint: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, marginTop: 2 },

    payBtn: {
      marginTop: 14, backgroundColor: accent.accent, borderRadius: 14, minHeight: moderateScale(52),
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 16,
    },
    payBtnDisabled: { opacity: 0.6 },
    payBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on },

    trustRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: tokens.successSkin, borderRadius: 14, padding: 13 },
    trustText: { flex: 1, fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec },
  });

/** Exact shape of this screen's stylesheet, for components that take it as a prop. */
export type PaymentOptionsStyles = ReturnType<typeof createStyles>;
