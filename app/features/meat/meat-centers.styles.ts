import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";

// Styles for app/meat-centers.tsx. Moved out of the screen unchanged -- every value
// is exactly as it was, so nothing renders differently. Lives here rather
// than beside the screen because app/ is Expo Router's routing directory
// and a non-route file in there is treated as a route.

export const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["meat"]) =>
  StyleSheet.create({
    centerContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
    topRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 12 },
    backBtn: {
      width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center",
    },
    addressBlock: { flex: 1, minWidth: 0 },
    addressEyebrow: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(11), letterSpacing: 1, textTransform: "uppercase", color: accent.accent },
    addressLabelRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
    addressLabel: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(15), color: tokens.text, flexShrink: 1 },
    iconBtn: {
      width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center",
    },

    searchRow: {
      flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: tokens.surface,
      borderWidth: 1, borderColor: tokens.border, borderRadius: moderateScale(14), height: moderateScale(48),
      paddingHorizontal: 14, marginHorizontal: 16, marginBottom: 14,
    },
    searchInput: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: moderateScale(14), color: tokens.text },

    headline: { paddingHorizontal: 16, paddingTop: 18 },
    headlineText: { fontFamily: fontFamilies.heading.semibold, fontSize: moderateScale(24), letterSpacing: -0.3, color: tokens.text },
    headlineSub: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(13), color: tokens.sec, marginTop: 6 },

    typesRow: { paddingHorizontal: 16, paddingVertical: 18, gap: 16 },
    typeItem: { alignItems: "center", gap: 8, width: moderateScale(64) },
    typeCircle: {
      width: moderateScale(64), height: moderateScale(64), borderRadius: moderateScale(32),
      backgroundColor: tokens.sunken, alignItems: "center", justifyContent: "center",
    },
    typeCircleActive: { borderWidth: 2, borderColor: accent.accent, backgroundColor: accent.skin },
    typeLabel: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(12), color: tokens.text, textAlign: "center" },

    chipsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 4 },
    chip: {
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.borderStrong,
      borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9,
    },
    chipActive: { backgroundColor: accent.accent, borderColor: accent.accent },
    chipText: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(13), color: tokens.sec },
    chipTextActive: { fontFamily: fontFamilies.body.semibold, color: accent.on },
  });
