import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Module-level values shared by the parts of useMapPicker.

export const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["ride"], insets: { bottom: number }) =>
  StyleSheet.create({
    mapContainer: { flex: 1 },
    backBtn: {
      position: "absolute", left: 16, width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center", zIndex: 10,
    },
    recenterBtn: {
      position: "absolute", right: 16, bottom: "44%", width: moderateScale(44), height: moderateScale(44), borderRadius: moderateScale(22),
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center", zIndex: 10,
    },
    centerMarkerContainer: { position: "absolute", top: "50%", left: "50%", marginLeft: -moderateScale(17), marginTop: -moderateScale(80), alignItems: "center" },
    dragHint: { backgroundColor: tokens.text, borderRadius: 9, paddingHorizontal: 11, paddingVertical: 7 },
    dragHintText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.small, color: tokens.bg },
    dragHintStem: { width: 2, height: 12, backgroundColor: tokens.text },
    pinWrapper: { alignItems: "center" },
    pinHead: {
      width: moderateScale(34), height: moderateScale(34), borderRadius: moderateScale(17), backgroundColor: accent.accent,
      borderWidth: 3, borderColor: tokens.surface, alignItems: "center", justifyContent: "center",
    },
    pinDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: accent.on },
    pinStem: { width: 2, height: 18, backgroundColor: accent.accent },
    pinShadow: { width: 12, height: 5, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.28)" },

    bottomPanel: {
      backgroundColor: tokens.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
      paddingHorizontal: 20, paddingTop: 12, paddingBottom: insets.bottom + 18,
      borderTopWidth: 1, borderColor: tokens.border,
    },
    sheetHandle: { alignSelf: "center", width: 38, height: 4, borderRadius: 2, backgroundColor: tokens.borderStrong, marginBottom: 18 },
    panelTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.extraLarge, letterSpacing: -0.2, color: tokens.text, marginBottom: 6 },
    panelSub: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, marginBottom: 16 },

    addressCard: {
      backgroundColor: tokens.bg, borderWidth: 1, borderColor: tokens.border, borderRadius: 14,
      padding: 14, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14,
    },
    addressDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2.5, borderColor: accent.accent, flexShrink: 0 },
    addressInfo: { flex: 1, minWidth: 0 },
    addressMain: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    addressSub: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 2 },
    addressCoords: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.muted, marginTop: 3, letterSpacing: 0.2 },
    editLink: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 0.5, textTransform: "uppercase", color: accent.accent },

    confirmBtn: { backgroundColor: accent.accent, borderRadius: 14, minHeight: moderateScale(52), alignItems: "center", justifyContent: "center" },
    confirmBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on },
  });

/** Exact shape of this screen's stylesheet, for components that take it as a prop. */
export type MapPickerStyles = ReturnType<typeof createStyles>;
