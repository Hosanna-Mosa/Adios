import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/checkout.tsx. Moved out of the screen unchanged -- every value
// is exactly as it was, so nothing renders differently. Lives here rather
// than beside the screen because app/ is Expo Router's routing directory
// and a non-route file in there is treated as a route.

export const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["food"]) =>
  StyleSheet.create({

    section: { paddingHorizontal: 16, paddingTop: 18 },
    sectionLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginBottom: 12 },

    addressCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 18, padding: 14 },
    addressCardBlocked: { borderColor: tokens.error, backgroundColor: tokens.errorSkin },
    addressAvatar: { width: 34, height: 34, borderRadius: 11, backgroundColor: accent.skin, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    addressAvatarText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.accent },
    addressTitle: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    addressLine: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, marginTop: 3 },
    addressContact: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 5 },
    addressWarnRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
    addressWarnText: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.error },
    changeLink: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 0.5, textTransform: "uppercase", color: accent.accent, flexShrink: 0 },

    orderCard: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 18, padding: 14 },
    orderCardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
    orderCardTitle: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    orderLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
    orderLineLabel: { flex: 1, fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, color: tokens.sec, marginRight: 10 },
    orderLineValue: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text },

    couponOptionRow: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: tokens.border, borderRadius: 14, padding: 13, minHeight: 56 },
    couponOptionRowLocked: { opacity: 0.55 },
    couponIconCircle: { width: 32, height: 32, borderRadius: 10, backgroundColor: accent.skin, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    couponSaving: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.small, color: tokens.success, marginTop: 3 },
    radioSelected: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: accent.accent, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    radioDot: { width: 10, height: 10, borderRadius: 5 },
    couponCode: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    couponDesc: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 2 },
    scheduleNote: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.sec, marginTop: 10 },
    promoInputRow: { flexDirection: "row", gap: 10 },
    promoInput: {
      flex: 1, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 12,
      paddingHorizontal: 14, height: moderateScale(44), fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text,
    },
    promoApplyBtn: { backgroundColor: accent.accent, borderRadius: 12, paddingHorizontal: 18, alignItems: "center", justifyContent: "center" },
    promoApplyBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on },
    promoError: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.error, marginTop: 8 },

    tipSub: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, marginTop: -6, marginBottom: 12 },
    tipRow: { flexDirection: "row", gap: 8 },
    tipPill: { flex: 1, borderWidth: 1, borderColor: tokens.borderStrong, backgroundColor: tokens.surface, borderRadius: 12, paddingVertical: 12, alignItems: "center", minHeight: 44 },
    tipPillText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    otherTipInput: {
      marginTop: 10, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 12,
      paddingHorizontal: 14, height: moderateScale(44), fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text,
    },

    billCard: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 18, padding: 16, gap: 11 },
    billRow: { flexDirection: "row", justifyContent: "space-between" },
    billLabel: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, color: tokens.sec },
    billValue: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text },
    billNote: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, color: tokens.muted },
    billDivider: { borderTopWidth: 1, borderTopColor: tokens.borderStrong, borderStyle: "dashed", marginTop: 3, paddingTop: 1 },
    billTotalLabel: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, color: tokens.text },
    billTotalValue: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.extraLarge, letterSpacing: -0.3, color: tokens.text },

    footer: {
      position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: tokens.surface,
      borderTopWidth: 1, borderTopColor: tokens.border, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 14,
    },
    blockedNote: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
    blockedNoteText: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.error },
    placeOrderBtn: {
      backgroundColor: accent.accent, borderRadius: 14, minHeight: moderateScale(52),
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    },
    placeOrderBtnDisabled: { opacity: 0.5 },
    placeOrderBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on },
    placeOrderBtnPrice: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on, opacity: 0.85 },
  });

/** Exact shape of this screen's stylesheet, for components that take it as a prop. */
export type CheckoutStyles = ReturnType<typeof createStyles>;
