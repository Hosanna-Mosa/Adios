import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/cart.tsx. Moved out of the screen unchanged -- every value
// is exactly as it was, so nothing renders differently. Lives here rather
// than beside the screen because app/ is Expo Router's routing directory
// and a non-route file in there is treated as a route.

export const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["food"]) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: tokens.bg },
    header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 12 },
    iconBtn: {
      width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center",
    },
    headerEyebrow: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: tokens.muted },
    headerTitle: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, letterSpacing: -0.1, color: tokens.text, marginTop: 2 },
    headerTitleSolo: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, color: tokens.text },

    section: { paddingHorizontal: 16, paddingTop: 18 },
    sectionLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginBottom: 12 },

    noticeCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      backgroundColor: tokens.warningSkin,
      borderWidth: 1,
      borderColor: tokens.warning,
      borderRadius: 14,
      padding: 12,
    },
    noticeTitle: { color: tokens.text, fontWeight: "600", marginBottom: 2 },
    noticeLine: { color: tokens.sec, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small },
    itemsCard: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 18, paddingHorizontal: 14 },
    itemRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 },
    itemRowDivider: { borderBottomWidth: 1, borderBottomColor: tokens.border },
    itemThumbWrap: { flexShrink: 0 },
    itemThumb: { width: moderateScale(46), height: moderateScale(46), borderRadius: 10, backgroundColor: tokens.sunken },
    itemThumbFallback: { alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: tokens.border },
    dietIcon: {
      position: "absolute", bottom: -4, left: -4, width: 16, height: 16, borderWidth: 1.5, borderRadius: 3,
      backgroundColor: tokens.surface, alignItems: "center", justifyContent: "center",
    },
    vegDot: { width: 7, height: 7, borderRadius: 4 },
    nonvegTriangle: { width: 0, height: 0, borderLeftWidth: 3.5, borderRightWidth: 3.5, borderBottomWidth: 6, borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: tokens.nonveg },
    itemName: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    itemMeta: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 2 },
    qtyPill: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: moderateScale(92),
      backgroundColor: accent.skin, borderWidth: 1, borderColor: accent.accent, borderRadius: 10, minHeight: moderateScale(34), flexShrink: 0,
    },
    qtyBtn: { width: 30, height: 34, alignItems: "center", justifyContent: "center" },
    qtyText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.accent },
    itemLinePrice: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text, width: 56, textAlign: "right", flexShrink: 0 },
    addMoreRow: { paddingVertical: 13 },
    addMoreText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.accent },

    complementCard: { width: 132, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 14, padding: 10 },
    complementImage: { width: "100%", height: 72, borderRadius: 8, backgroundColor: tokens.sunken, marginBottom: 9 },
    complementName: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    complementFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 7 },
    complementPrice: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    complementAddBtn: { width: 28, height: 28, borderRadius: 9, borderWidth: 1, borderColor: accent.accent, alignItems: "center", justifyContent: "center" },

    couponRow: {
      flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: tokens.surface,
      borderWidth: 1, borderColor: accent.accent, borderStyle: "dashed", borderRadius: 16, padding: 14, minHeight: 56,
    },
    couponIconCircle: { width: 34, height: 34, borderRadius: 11, backgroundColor: accent.skin, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    couponTitle: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    couponSub: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 2 },
    couponAction: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 0.5, textTransform: "uppercase", color: accent.accent, flexShrink: 0 },
    promoInputRow: { flexDirection: "row", gap: 10, marginTop: 10 },
    promoInput: {
      flex: 1, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 12,
      paddingHorizontal: 14, height: moderateScale(44), fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text,
    },
    promoApplyBtn: { backgroundColor: accent.accent, borderRadius: 12, paddingHorizontal: 18, alignItems: "center", justifyContent: "center" },
    promoApplyBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on },
    promoError: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.error, marginTop: 8 },

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
    continueBtn: {
      backgroundColor: accent.accent, borderRadius: 14, minHeight: moderateScale(52),
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    },
    continueBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on },
    continueBtnPrice: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on, opacity: 0.85 },

    emptyWrap: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32 },
    emptyIconCircle: { width: 76, height: 76, borderRadius: 24, backgroundColor: accent.skin, alignItems: "center", justifyContent: "center", marginBottom: 20 },
    emptyTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.extraLarge, letterSpacing: -0.2, color: tokens.text, textAlign: "center" },
    emptySubtitle: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, textAlign: "center", marginTop: 10, marginBottom: 22 },
    primaryBtn: { width: "100%", backgroundColor: accent.accent, borderRadius: 14, minHeight: moderateScale(48), alignItems: "center", justifyContent: "center" },
    primaryBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on },
    secondaryBtn: { width: "100%", marginTop: 10, borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 14, minHeight: moderateScale(48), alignItems: "center", justifyContent: "center" },
    secondaryBtnText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: accent.accent },

    recentSection: { paddingHorizontal: 16, paddingTop: 36 },
    recentLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginBottom: 12 },
    recentCard: { width: 150 },
    recentImagePlaceholder: { width: 150, height: 100, borderRadius: 8, backgroundColor: tokens.sunken, borderWidth: 1, borderColor: tokens.border },
    recentName: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text, marginTop: 8 },
    recentMeta: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 2 },
  });
