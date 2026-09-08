import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";

// Moved verbatim out of app/restaurant-details.tsx. The `header`/`backBtn`/
// `headerTitle` keys are gone: that markup is now ui/Header, which carries the
// same 40pt chip and body.semibold 17 title.

export const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["food"]) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: tokens.bg },

    section: { paddingHorizontal: 16, paddingTop: 20 },
    name: { fontFamily: fontFamilies.heading.semibold, fontSize: moderateScale(24), letterSpacing: -0.3, color: tokens.text },
    badgeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" },
    vegBadge: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: tokens.veg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
    vegIconBox: { width: 13, height: 13, borderWidth: 1.5, borderColor: tokens.veg, borderRadius: 3, alignItems: "center", justifyContent: "center" },
    vegDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: tokens.veg },
    vegBadgeText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(11), letterSpacing: 1, textTransform: "uppercase", color: tokens.veg },
    ratingBadge: { backgroundColor: tokens.successSkin, borderRadius: 6, paddingHorizontal: 9, paddingVertical: 5 },
    ratingBadgeText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(11), letterSpacing: 1, textTransform: "uppercase", color: tokens.success },
    statusBadge: { borderRadius: 6, paddingHorizontal: 9, paddingVertical: 5 },
    statusBadgeText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(11), letterSpacing: 1, textTransform: "uppercase" },
    cuisineLine: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(15), lineHeight: moderateScale(23), color: tokens.sec, marginTop: 14 },

    divider: { height: 1, backgroundColor: tokens.border, marginHorizontal: 16, marginTop: 20 },

    sectionLabel: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(11), letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginBottom: 12 },
    hygieneCard: { backgroundColor: tokens.successSkin, borderRadius: 16, padding: 14, gap: 9 },
    hygieneRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
    hygieneText: { flex: 1, fontFamily: fontFamilies.body.regular, fontSize: moderateScale(14), lineHeight: moderateScale(20), color: tokens.sec },

    card: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 16, padding: 14 },

    offerRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    offerRowDivider: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: tokens.border },
    offerCodeChip: { backgroundColor: accent.skin, borderWidth: 1, borderColor: accent.accent, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5 },
    offerCodeText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(12), letterSpacing: 0.6, color: accent.accent },
    offerTitle: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(14), color: tokens.text },
    offerDescription: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(13), color: tokens.sec, marginTop: 3 },

    timingTodayRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: tokens.border },
    timingTodayLabel: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(11), letterSpacing: 1, textTransform: "uppercase", color: accent.accent },
    timingTodayValue: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(14), color: tokens.text },
    timingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 5 },
    timingDay: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(14), color: tokens.sec },
    timingHours: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(14), color: tokens.sec },
    timingRowToday: { fontFamily: fontFamilies.body.bold, color: tokens.text },
    addressText: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(15), lineHeight: moderateScale(22), color: tokens.text },
    navigateBtn: { marginTop: 12, backgroundColor: accent.skin, borderWidth: 1, borderColor: accent.accent, borderRadius: 12, minHeight: moderateScale(44), alignItems: "center", justifyContent: "center" },
    navigateBtnText: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(14), color: accent.accent },

    contactCard: {
      flex: 1, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 16,
      paddingHorizontal: 14, paddingVertical: 13, minHeight: moderateScale(56), flexDirection: "row", alignItems: "center", gap: 10,
    },
    contactLabel: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(10), letterSpacing: 1, textTransform: "uppercase", color: tokens.muted },
    contactValue: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(14), color: tokens.text, marginTop: 2 },
  });

export type RestaurantDetailsStyles = ReturnType<typeof createStyles>;
