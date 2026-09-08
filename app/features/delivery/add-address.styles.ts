import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";

// Styles for app/delivery/add-address.tsx. Moved out of the screen unchanged -- every value
// is exactly as it was, so nothing renders differently. Lives here rather
// than beside the screen because app/ is Expo Router's routing directory
// and a non-route file in there is treated as a route.

export const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["delivery"]) =>
  StyleSheet.create({
    iconBtn: {
      width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center",
    },

    searchRow: { position: "absolute", left: 16, right: 16, zIndex: 10, flexDirection: "row", gap: 10 },
    searchBox: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 14, paddingHorizontal: 14, minHeight: moderateScale(40) },
    searchInput: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: moderateScale(14), color: tokens.text },
    searchResults: { position: "absolute", left: 66, right: 16, maxHeight: 250, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 12, zIndex: 9 },
    searchResultRow: { padding: 12, borderBottomWidth: 1, borderBottomColor: tokens.border },
    searchResultName: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(13), color: tokens.text },
    searchResultAddr: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(11), color: tokens.sec, marginTop: 2 },

    useCurrentWrap: { position: "absolute", left: 16, top: "40%" },
    useCurrentBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
    useCurrentText: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(12), color: accent.accent },

    centerMarker: { position: "absolute", top: "38%", left: "50%", marginLeft: -moderateScale(17), marginTop: -moderateScale(80), alignItems: "center" },
    dragHint: { backgroundColor: tokens.text, borderRadius: 9, paddingHorizontal: 11, paddingVertical: 7 },
    dragHintText: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(12), color: tokens.bg },
    dragHintStem: { width: 2, height: 10, backgroundColor: tokens.text },
    pinHead: { width: moderateScale(34), height: moderateScale(34), borderRadius: moderateScale(17), backgroundColor: accent.accent, borderWidth: 3, borderColor: tokens.surface, alignItems: "center", justifyContent: "center" },
    pinDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: accent.on },
    pinStem: { width: 2, height: 18, backgroundColor: accent.accent },
    pinShadow: { width: 12, height: 5, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.28)" },

    bottomCard: {
      position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: tokens.surface,
      borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderColor: tokens.border,
    },
    sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: tokens.borderStrong, alignSelf: "center", marginBottom: 14 },
    addressCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: tokens.bg, borderWidth: 1, borderColor: tokens.border, borderRadius: 14, padding: 14, marginBottom: 14 },
    addressIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    addressMain: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(15), color: tokens.text },
    addressSub: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(13), color: tokens.sec, marginTop: 2 },
    addressCoords: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(11), color: tokens.muted, marginTop: 3, letterSpacing: 0.2 },
    changeLink: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(12), letterSpacing: 0.5, textTransform: "uppercase", color: accent.accent },
    nextBtn: { backgroundColor: accent.accent, borderRadius: 14, minHeight: moderateScale(52), alignItems: "center", justifyContent: "center" },
    nextBtnText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(15), color: accent.on },

    header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 10 },
    headerTitle: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(17), color: tokens.text },

    mapPreview: { height: 160, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: tokens.border, marginHorizontal: 16, marginTop: 4, position: "relative" },
    mapPreviewPin: { position: "absolute", top: "50%", left: "50%", marginLeft: -18, marginTop: -18, width: 36, height: 36, borderRadius: 18, backgroundColor: accent.accent, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
    mapPreviewPill: { position: "absolute", bottom: 10, alignSelf: "center", backgroundColor: tokens.surface, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: tokens.border, maxWidth: "82%" },
    mapPreviewPillText: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(12), color: tokens.text },
    mapPreviewCoords: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(11), color: tokens.muted, textAlign: "center", marginTop: 6, marginHorizontal: 16 },

    section: { paddingHorizontal: 16, paddingTop: 20 },
    sectionLabel: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(11), letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginBottom: 10 },
    chip: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 12, minHeight: moderateScale(44) },
    chipText: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(14), color: tokens.sec },
    customLabelInput: {
      marginTop: 12, borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 10, paddingHorizontal: 14, height: moderateScale(44),
      fontFamily: fontFamilies.body.medium, fontSize: moderateScale(14), color: tokens.text, backgroundColor: tokens.surface,
    },
    fieldLabel: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(11), letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginBottom: 6 },
    fieldRow: { flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1.5, borderBottomColor: tokens.borderStrong, paddingBottom: 8 },
    fieldInput: { flex: 1, fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(15), color: tokens.text },
    fieldHint: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(12), color: tokens.muted, marginTop: 10 },
    instructionsBox: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 12, padding: 13, minHeight: 72 },
    instructionsInput: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(14), color: tokens.text, minHeight: 44 },
    charCounter: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(11), color: tokens.muted, textAlign: "right", marginTop: 6 },

    footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: tokens.border, backgroundColor: tokens.surface },
    saveBtn: { backgroundColor: accent.accent, borderRadius: 14, minHeight: moderateScale(52), alignItems: "center", justifyContent: "center" },
    saveBtnText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(15), color: accent.on },
  });
