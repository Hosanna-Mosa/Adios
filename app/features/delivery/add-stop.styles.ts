import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";

// Styles for app/delivery/add-stop.tsx. Moved out of the screen unchanged -- every value
// is exactly as it was, so nothing renders differently. Lives here rather
// than beside the screen because app/ is Expo Router's routing directory
// and a non-route file in there is treated as a route.

export const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["delivery"]) =>
  StyleSheet.create({

    section: { paddingHorizontal: 16, paddingTop: 20 },
    fieldLabel: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(11), letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginBottom: 6 },
    fieldBox: { borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 12, backgroundColor: tokens.surface, paddingHorizontal: 14, minHeight: 48, flexDirection: "row", alignItems: "center", gap: 8 },
    fieldBoxFocused: { borderWidth: 2, borderColor: accent.accent },
    fieldInput: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: moderateScale(15), color: tokens.text },

    dropdown: { backgroundColor: tokens.surface, borderWidth: 2, borderTopWidth: 0, borderColor: accent.accent, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, overflow: "hidden" },
    dropdownRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
    dropdownRowDivider: { borderBottomWidth: 1, borderBottomColor: tokens.border },
    dropdownMain: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(13), color: tokens.text },
    dropdownSub: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(11), color: tokens.sec, marginTop: 1 },

    sectionLabel: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(11), letterSpacing: 1, textTransform: "uppercase", color: tokens.muted },
    itemsHeadRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 },
    itemsCount: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(13), color: tokens.sec },
    itemsCard: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 18, paddingHorizontal: 14 },
    itemRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
    itemRowDivider: { borderBottomWidth: 1, borderBottomColor: tokens.border },
    itemQtyBadge: { width: 26, height: 26, borderRadius: 8, backgroundColor: accent.skin, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    itemQtyBadgeText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(12), color: accent.accent },
    itemName: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: moderateScale(15), color: tokens.text },
    itemPrice: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(14), color: tokens.sec },
    addItemRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 },
    addItemInput: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: moderateScale(15), color: tokens.text },
    addItemPriceInput: { width: 64, fontFamily: fontFamilies.body.medium, fontSize: moderateScale(14), color: tokens.text, textAlign: "right" },
    itemsHint: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(13), lineHeight: moderateScale(18), color: tokens.sec, marginTop: 10 },

    suggestionRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 14, padding: 12, minHeight: 56 },
    suggestionThumb: { width: 34, height: 34, borderRadius: 11, backgroundColor: tokens.sunken, flexShrink: 0 },
    suggestionName: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(14), color: tokens.text },
    suggestionMeta: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(12), color: tokens.sec, marginTop: 2 },

    footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: tokens.border, backgroundColor: tokens.surface },
    previewBanner: { backgroundColor: tokens.warningSkin, borderRadius: 12, padding: 11, marginBottom: 10 },
    previewBannerText: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(13), lineHeight: moderateScale(18), color: tokens.sec },
    previewBannerBold: { fontFamily: fontFamilies.body.bold, color: tokens.text },
    addBtn: { backgroundColor: accent.accent, borderRadius: 14, minHeight: moderateScale(52), alignItems: "center", justifyContent: "center" },
    addBtnText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(15), color: accent.on },
  });
