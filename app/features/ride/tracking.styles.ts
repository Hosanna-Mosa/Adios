import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/tracking.tsx. Moved out of the screen unchanged -- every value
// is exactly as it was, so nothing renders differently. Lives here rather
// than beside the screen because app/ is Expo Router's routing directory
// and a non-route file in there is treated as a route.

export const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["food"]) =>
  StyleSheet.create({
    topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", zIndex: 10, paddingHorizontal: 16 },
    backBtn: {
      width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center",
      shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
    },
    etaChip: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 5 },
    etaChipText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium },

    bottomSheet: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 0 },

    findingWrap: { alignItems: "center", justifyContent: "center", paddingVertical: 28 },
    radarWrap: { width: 110, height: 110, alignItems: "center", justifyContent: "center", marginBottom: 18 },
    radarCenter: { width: 56, height: 56, borderRadius: 999, alignItems: "center", justifyContent: "center" },
    findingTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.large, color: tokens.text, textAlign: "center" },
    findingSubtitle: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 6, textAlign: "center" },

    timelineBlock: { paddingTop: 14, marginBottom: 8 },
    stepDotDone: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    stepDotCurrentWrap: { width: 20, height: 20, alignItems: "center", justifyContent: "center" },
    stepDotCurrentPulse: { position: "absolute", width: 20, height: 20, borderRadius: 10, opacity: 0.3 },
    stepDotCurrent: { width: 11, height: 11, borderRadius: 6 },
    stepDotFuture: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: tokens.borderStrong, backgroundColor: tokens.surface },
    stepLine: { width: 2, flex: 1, minHeight: 16, marginTop: 2 },
    stepLabel: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium },
    stepSub: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec, marginTop: 2 },

    partnerRow: {
      flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, marginBottom: 10,
      borderTopWidth: 1, borderBottomWidth: 1, borderColor: tokens.border,
    },
    partnerAvatar: { width: 46, height: 46, borderRadius: 999, backgroundColor: tokens.sunken, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center" },
    partnerNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    partnerName: { flexShrink: 1, fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    partnerRatingPill: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, backgroundColor: accent.skin },
    partnerRatingText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small },
    partnerMeta: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec, marginTop: 2 },
    circleBtn: { width: 40, height: 40, borderRadius: 999, alignItems: "center", justifyContent: "center" },
    circleBtnOutline: { width: 40, height: 40, borderRadius: 999, borderWidth: 1, borderColor: tokens.borderStrong, alignItems: "center", justifyContent: "center", position: "relative" },
    badge: { position: "absolute", top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: tokens.surface, paddingHorizontal: 2 },
    badgeText: { color: "#fff", fontSize: typography.sizes.small, fontFamily: fontFamilies.body.bold },

    pinCard: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12 },
    pinLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase" },
    pinBoxes: { flexDirection: "row", gap: 8, marginTop: 10 },
    pinBox: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: "center", backgroundColor: tokens.surface },
    pinDigit: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.large, color: tokens.text },
    pinHint: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.sec, marginTop: 10, lineHeight: typography.lineHeights.small },

    helperUpdate: { borderRadius: 14, padding: 13, marginBottom: 14 },
    helperUpdateLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase" },
    helperUpdateText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text, marginTop: 4 },

    addrCard: { flexDirection: "row", gap: 12, backgroundColor: tokens.bg, borderWidth: 1, borderColor: tokens.border, borderRadius: 14, padding: 14, marginBottom: 16 },
    addrRail: { width: 12, alignItems: "center", paddingTop: 4 },
    addrDot: { width: 9, height: 9, borderRadius: 999, borderWidth: 2.5 },
    addrLine: { width: 2, flex: 1, minHeight: 20, backgroundColor: tokens.borderStrong, marginVertical: 4 },
    addrLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: tokens.muted },
    addrText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text, marginTop: 3 },

    footerBtnOutline: { flex: 1, borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 14, minHeight: moderateScale(48), alignItems: "center", justifyContent: "center" },
    footerBtnOutlineText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.sec },

    modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
    modalContent: { backgroundColor: tokens.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12 },
    sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: tokens.borderStrong, alignSelf: "center", marginBottom: 14 },
    modalTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.large, color: tokens.text },
    modalOrderIdRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderColor: tokens.border, paddingVertical: 14 },
    modalOrderIdValue: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.text },

    // Completed screen
    doneRoot: { flex: 1, backgroundColor: tokens.bg, alignItems: "center" },
    doneHead: { alignItems: "center", paddingHorizontal: 24, marginBottom: 8 },
    doneCheck: { width: 64, height: 64, borderRadius: 999, backgroundColor: tokens.success, alignItems: "center", justifyContent: "center", marginBottom: 14 },
    doneTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.extraLarge, letterSpacing: -0.3, color: tokens.text, textAlign: "center" },
    doneSubtitle: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, textAlign: "center", marginTop: 8, paddingHorizontal: 12 },
    donePrice: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text, marginTop: 8 },
    doneCard: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 16, padding: 16, marginTop: 14 },
    doneCardTitle: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 0.6, textTransform: "uppercase", color: tokens.muted, marginBottom: 10 },
    doneAddrText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.text },
    dotSmall: { width: 8, height: 8, borderRadius: 4 },
    doneHomeBtn: { borderRadius: 14, minHeight: moderateScale(52), alignItems: "center", justifyContent: "center" },
    doneHomeBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium },

    reviewCard: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 16, padding: 16, marginTop: 14 },
    reviewTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.large, color: tokens.text },
    submittedPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: tokens.successSkin, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
    submittedPillText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.small },
    reviewTagChip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
    reviewTagChipText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small },
    reviewComment: { fontFamily: fontFamilies.body.regular, fontStyle: "italic", fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 10 },
    reviewCommentInput: {
      borderWidth: 1, borderColor: tokens.border, borderRadius: 12, padding: 12, fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium,
      color: tokens.text, marginTop: 14, minHeight: 60, textAlignVertical: "top",
    },
    reviewSubmitBtn: { borderRadius: 14, minHeight: moderateScale(50), alignItems: "center", justifyContent: "center", marginTop: 14 },
    reviewSubmitBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium },
  });

/** Exact shape of this screen's stylesheet, for components that take it as a prop. */
export type TrackingStyles = ReturnType<typeof createStyles>;
