import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/ride-confirmation.tsx. Moved out of the screen unchanged -- every value
// is exactly as it was, so nothing renders differently. Lives here rather
// than beside the screen because app/ is Expo Router's routing directory
// and a non-route file in there is treated as a route.

export const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["ride"], insets: { bottom: number }) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: tokens.bg },
    mapContainer: { flex: 1 },
    mapOverlay: { position: "absolute", left: 16, right: 16, zIndex: 10, flexDirection: "row", justifyContent: "space-between" },
    circleBtn: {
      width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center",
    },
    toolGroup: { gap: 8 },
    toolCircleBtn: {
      width: moderateScale(38), height: moderateScale(38), borderRadius: moderateScale(19),
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center",
    },
    routeChip: {
      position: "absolute", left: 66, right: 16, top: 54,
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 9,
    },
    routeChipMain: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },
    routeChipSub: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec, marginTop: 2 },

    mapPinContainer: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    pickupDotMarker: { width: 22, height: 22, borderRadius: 11, backgroundColor: tokens.surface, borderWidth: 4, borderColor: accent.accent },
    dropSquareMarker: { width: 22, height: 22, borderRadius: 6, backgroundColor: tokens.text, borderWidth: 3, borderColor: tokens.surface },
    userPin: { width: 22, height: 22, borderRadius: 11, backgroundColor: accent.accent, borderWidth: 3, borderColor: "#fff", alignItems: "center", justifyContent: "center" },
    pinInnerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },
    stopPin: { width: 18, height: 18, backgroundColor: tokens.text, transform: [{ rotate: "45deg" }], borderWidth: 2, borderColor: tokens.surface },
    stopPinText: { color: "#fff", fontSize: typography.sizes.small, fontFamily: fontFamilies.body.bold, transform: [{ rotate: "-45deg" }] },
    locationBubble: {
      flexDirection: "row", alignItems: "center", backgroundColor: tokens.surface, paddingVertical: 6, paddingLeft: 12, paddingRight: 8,
      borderRadius: 10, minWidth: 100, maxWidth: 160, marginBottom: 10, borderWidth: 1, borderColor: tokens.border,
    },
    locationBubbleText: { flex: 1, fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: tokens.text },
    editBubbleBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: accent.skin, alignItems: "center", justifyContent: "center", marginLeft: 6 },

    sheet: {
      height: "63%", backgroundColor: tokens.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12,
      borderTopWidth: 1, borderColor: tokens.border,
    },
    sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: tokens.borderStrong, alignSelf: "center", marginBottom: 14 },
    sheetHeadRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 12 },
    sheetTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.extraLarge, letterSpacing: -0.2, color: tokens.text },
    addStopLink: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: accent.accent },

    tierRow: { flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.bg, borderRadius: 16, padding: 12, minHeight: 72 },
    tierRowSelected: { borderColor: accent.accent, backgroundColor: accent.skin },
    tierIconCircle: { width: 46, height: 46, borderRadius: 14, backgroundColor: accent.skin, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    tierName: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, color: tokens.text },
    tierMeta: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 2 },
    tierPrice: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.large, letterSpacing: -0.3, color: tokens.text },

    scheduleRow: {
      flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12, backgroundColor: tokens.bg,
      borderWidth: 1, borderColor: tokens.border, borderRadius: 14, padding: 14, minHeight: 56,
    },
    scheduleIconCircle: { width: 34, height: 34, borderRadius: 11, backgroundColor: accent.skin, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    scheduleTitle: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    scheduleSub: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec, marginTop: 1 },

    footer: { paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: tokens.border, backgroundColor: tokens.surface },
    bookBtn: {
      backgroundColor: accent.accent, borderRadius: 14, minHeight: moderateScale(52), marginBottom: 14,
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    },
    bookBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on },
    bookBtnPrice: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on, opacity: 0.85 },

    sheetOverlay: { flex: 1, justifyContent: "flex-end" },
    sheetScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
    datePickerSheet: { backgroundColor: tokens.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, paddingHorizontal: 20, maxHeight: "88%" },
    datePickerTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.extraLarge, letterSpacing: -0.2, color: tokens.text, marginBottom: 6 },
    datePickerSub: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, marginBottom: 18 },
    pickerLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginBottom: 10 },
    dateCard: { width: 62, borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 14, paddingVertical: 10, alignItems: "center" },
    dateCardDay: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec },
    dateCardNum: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.large, color: tokens.text, marginTop: 4 },
    timeChip: { borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
    timeChipText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.text },
    scheduleSummaryRow: {
      flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: tokens.bg, borderWidth: 1, borderColor: tokens.border,
      borderRadius: 14, padding: 13, marginBottom: 16,
    },
    confirmScheduleBtn: { backgroundColor: accent.accent, borderRadius: 14, minHeight: moderateScale(52), alignItems: "center", justifyContent: "center", marginBottom: 20 },
    confirmScheduleBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on },

    successBlock: { alignItems: "center", paddingHorizontal: 24, paddingTop: 52 },
    successIcon: { width: 76, height: 76, borderRadius: 999, backgroundColor: tokens.success, alignItems: "center", justifyContent: "center", marginBottom: 22 },
    successTitle: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.extraLarge, lineHeight: typography.lineHeights.extraLarge, letterSpacing: -0.5, color: tokens.text, textAlign: "center" },
    successSub: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, marginTop: 12, textAlign: "center" },

    section: { paddingHorizontal: 16, paddingTop: 28 },
    detailsCard: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 18, overflow: "hidden" },
    detailsRow: { flexDirection: "row", justifyContent: "space-between", padding: 14, borderBottomWidth: 1, borderBottomColor: tokens.border, gap: 16 },
    detailsLabel: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, color: tokens.sec, flexShrink: 0 },
    detailsValue: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text, textAlign: "right", flexShrink: 1 },
    detailsPrice: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.extraLarge, letterSpacing: -0.3, color: tokens.text },
    estimateNote: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, marginTop: 10, marginHorizontal: 2 },

    footerPrimaryBtn: { backgroundColor: accent.accent, borderRadius: 14, minHeight: moderateScale(52), alignItems: "center", justifyContent: "center" },
    footerPrimaryBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on },
    footerSecondaryBtn: { marginTop: 8, borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 14, minHeight: moderateScale(48), alignItems: "center", justifyContent: "center" },
    footerSecondaryBtnText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.sec },
  });
