import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/finding-driver.tsx. Moved out of the screen unchanged -- every value
// is exactly as it was, so nothing renders differently. Lives here rather
// than beside the screen because app/ is Expo Router's routing directory
// and a non-route file in there is treated as a route.

export const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["ride"]) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: tokens.bg },
    backBtn: {
      position: "absolute", left: 16, zIndex: 10, width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center",
    },
    radarWrap: { position: "absolute", left: "50%", top: "26%", marginLeft: -110, marginTop: -110, width: 220, height: 220, alignItems: "center", justifyContent: "center" },
    radarRing: { position: "absolute", width: 220, height: 220, borderRadius: 999, backgroundColor: accent.accent },
    radarDot: { width: 26, height: 26, borderRadius: 999, backgroundColor: accent.accent, borderWidth: 4, borderColor: tokens.surface },

    sheet: {
      position: "absolute", left: 0, right: 0, bottom: 0, height: "52%",
      backgroundColor: tokens.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12,
      borderTopWidth: 1, borderColor: tokens.border,
    },
    sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: tokens.borderStrong, alignSelf: "center", marginBottom: 16 },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 6 },
    spinner: { width: 22, height: 22, borderRadius: 11, borderWidth: 2.5, borderColor: accent.accent, borderTopColor: "transparent" },
    title: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.extraLarge, letterSpacing: -0.2, color: tokens.text },
    subtitle: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, marginBottom: 16 },

    routeCard: { backgroundColor: tokens.bg, borderWidth: 1, borderColor: tokens.border, borderRadius: 16, padding: 14, marginBottom: 12 },
    routeCardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: tokens.border },
    routeCardHeadLabel: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    routeCardHeadValue: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.extraLarge, letterSpacing: -0.3, color: tokens.text },
    routeRow: { flexDirection: "row", gap: 12, paddingTop: 12 },
    routeRail: { width: 12, alignItems: "center", paddingTop: 5 },
    routePickupDot: { width: 9, height: 9, borderRadius: 5, borderWidth: 2.5, borderColor: accent.accent },
    routeDropSquare: { width: 9, height: 9, borderRadius: 2, backgroundColor: tokens.text },
    routeLine: { width: 2, flex: 1, minHeight: 18, backgroundColor: tokens.borderStrong, marginVertical: 3 },
    routeAddr: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text },
    routeMeta: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },

    searchingChip: { backgroundColor: accent.skin, borderRadius: 12, padding: 12, marginBottom: 14, alignSelf: "flex-start" },
    searchingLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: accent.accent },
    searchingValue: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text, marginTop: 4 },

    cancelBtn: { borderWidth: 1, borderColor: tokens.error, borderRadius: 14, minHeight: moderateScale(52), alignItems: "center", justifyContent: "center" },
    cancelBtnText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.error },

    sheetOverlay: { flex: 1, justifyContent: "flex-end" },
    sheetScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
    cancelSheet: { backgroundColor: tokens.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, paddingHorizontal: 20 },
    cancelSheetTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.extraLarge, letterSpacing: -0.2, color: tokens.text, marginBottom: 6 },
    cancelSheetSub: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, marginBottom: 16 },
    reasonRow: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, minHeight: 48 },
    radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: tokens.borderStrong, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    radioInner: { width: 10, height: 10, borderRadius: 5 },
    reasonText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text },
    cancelSheetCancelBtn: { flex: 1, borderWidth: 1, borderColor: tokens.error, borderRadius: 14, minHeight: moderateScale(52), alignItems: "center", justifyContent: "center" },
    cancelSheetCancelBtnText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.error },
    cancelSheetKeepBtn: { flex: 1, borderRadius: 14, minHeight: moderateScale(52), alignItems: "center", justifyContent: "center" },
    cancelSheetKeepBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium },

    confirmedIcon: { width: 76, height: 76, borderRadius: 999, backgroundColor: tokens.success, alignItems: "center", justifyContent: "center", marginBottom: 22 },
    confirmedTitle: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.extraLarge, letterSpacing: -0.3, color: tokens.text, textAlign: "center" },
    confirmedSub: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, textAlign: "center", marginTop: 12, marginBottom: 24 },
    confirmedCard: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 18, padding: 20, width: "100%", alignItems: "center", marginBottom: 30 },
    confirmedCardTitle: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginBottom: 10 },
    confirmedCardRow: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, color: tokens.text },
    confirmedCardRowMuted: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 4 },
    confirmedDoneBtn: { backgroundColor: accent.accent, borderRadius: 14, paddingHorizontal: 40, paddingVertical: 15, width: "100%", alignItems: "center" },
    confirmedDoneBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on },
  });
