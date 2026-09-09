import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/drop-location.tsx. Moved out of the screen unchanged -- every value
// is exactly as it was, so nothing renders differently. Lives here rather
// than beside the screen because app/ is Expo Router's routing directory
// and a non-route file in there is treated as a route.

export const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["ride"]) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: tokens.bg },
    header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 8 },
    backBtn: {
      width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center",
    },
    headerTitle: { flex: 1, fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, color: tokens.text },
    forMeSelector: {
      flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 8,
      borderRadius: 999, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.surface,
    },
    forMeText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },

    inputCard: {
      flexDirection: "row", gap: 12, marginHorizontal: 16, marginTop: 14, padding: 14,
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 18, zIndex: 100,
    },
    dotsContainer: { alignItems: "center", width: 14, paddingTop: 14 },
    pickupDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2.5, borderColor: accent.accent },
    dropSquare: { width: 10, height: 10, borderRadius: 2, backgroundColor: tokens.text },
    markerSlot: { alignItems: "center", justifyContent: "center" },
    stopDiamond: { width: 10, height: 10, backgroundColor: tokens.text, transform: [{ rotate: "45deg" }] },
    dashLine: { width: 2, flex: 1, minHeight: 24, backgroundColor: tokens.borderStrong, marginVertical: 4 },

    inputsContainer: { flex: 1, minWidth: 0, gap: 2 },
    fieldSlot: { minHeight: 44, justifyContent: "center" },
    dropFieldSlot: { borderWidth: 2, borderColor: accent.accent, borderRadius: 12, paddingHorizontal: 10, marginHorizontal: -2 },
    fieldLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: tokens.muted },
    divider: { height: 1, backgroundColor: tokens.border, marginVertical: 4 },
    locationInput: {
      flex: 1, width: "100%", height: moderateScale(28), fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium,
      color: tokens.text, backgroundColor: "transparent", paddingHorizontal: 0, marginTop: 2,
    },
    currentLocBtn: { justifyContent: "center", paddingLeft: 8 },

    actionRow: { flexDirection: "row", paddingHorizontal: 16, marginTop: 12, gap: 8 },
    actionBtn: {
      flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
      paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: tokens.borderStrong,
      backgroundColor: tokens.surface, minHeight: 44,
    },
    actionBtnText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.sec },

    stopInputRow: { flexDirection: "row", alignItems: "center" },
    stopActions: { flexDirection: "row", alignItems: "center", gap: 4 },
    dragBtn: { padding: 4 },
    removeBtn: { padding: 4 },

    placesScroll: { flex: 1, marginTop: 22 },
    sectionTitle: {
      fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase",
      color: tokens.muted, paddingHorizontal: 16, marginBottom: 10,
    },
    savedSection: { marginBottom: 18 },
    savedCard: { marginHorizontal: 16, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 16, overflow: "hidden" },
    savedRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 13, minHeight: 56 },
    savedRowDivider: { borderBottomWidth: 1, borderBottomColor: tokens.border },
    savedAvatar: { width: 36, height: 36, borderRadius: 11, backgroundColor: accent.skin, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    savedAvatarText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.accent },
    savedLabel: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    savedAddress: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 2 },

    placeItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 11, gap: 12, borderBottomWidth: 1, borderBottomColor: tokens.border },
    placeIconBox: { width: moderateScale(36), height: moderateScale(36), borderRadius: moderateScale(18), backgroundColor: tokens.sunken, alignItems: "center", justifyContent: "center" },
    placeInfo: { flex: 1, minWidth: 0 },
    placeName: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text },
    placeAddress: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 2 },
    emptyRecents: { paddingHorizontal: 16, paddingVertical: 14 },
    emptyRecentsText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },

    sheetOverlay: { flex: 1, justifyContent: "flex-end" },
    sheetScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
    bookingSheet: {
      backgroundColor: tokens.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, paddingHorizontal: 20, minHeight: 382,
    },
    sheetHandle: { alignSelf: "center", width: 38, height: 4, borderRadius: 2, backgroundColor: tokens.borderStrong, marginBottom: 20 },
    sheetTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.large, letterSpacing: -0.2, color: tokens.text, marginBottom: 18 },
    bookingOption: { minHeight: moderateScale(44), flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
    optionLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
    optionText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, color: tokens.text },
    radioOuter: { width: moderateScale(22), height: moderateScale(22), borderRadius: moderateScale(11), borderWidth: 2, alignItems: "center", justifyContent: "center" },
    radioInner: { width: moderateScale(12), height: moderateScale(12), borderRadius: moderateScale(6) },
    contactInputWrap: { marginBottom: 12, gap: 7, marginTop: 6 },
    contactInputLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 0.5, textTransform: "uppercase", color: tokens.muted },
    contactInput: {
      height: moderateScale(46), borderRadius: 12, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.surface,
      paddingHorizontal: 14, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text,
    },
    infoBox: {
      minHeight: 56, borderRadius: 13, backgroundColor: tokens.sunken, flexDirection: "row", alignItems: "flex-start", gap: 10,
      paddingHorizontal: 13, paddingVertical: 13, marginTop: 4, marginBottom: 20,
    },
    infoText: { flex: 1, fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec },
    doneButton: { minHeight: moderateScale(50), borderRadius: 14, alignItems: "center", justifyContent: "center" },
    doneButtonText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium },

    loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center", zIndex: 99999 },
    loadingCard: {
      backgroundColor: tokens.surface, paddingHorizontal: 26, paddingVertical: 20, borderRadius: 16, alignItems: "center", gap: 12,
      borderWidth: 1, borderColor: tokens.border,
    },
    loadingText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
  });
