import { StyleSheet } from "react-native";
import { moderateScale as ms } from "react-native-size-matters";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for the "Filters and sorting" sheet (HomeFilter + HomeFilterSections).
export const createFilterStyles = (tokens: ThemeTokens, accent: ServiceTokens) =>
  StyleSheet.create({
    sheet: { backgroundColor: tokens.surface, borderTopLeftRadius: ms(28), borderTopRightRadius: ms(28), height: "82%", overflow: "hidden" },
    handle: { alignSelf: "center", width: ms(44), height: 4, borderRadius: 2, backgroundColor: tokens.border, marginTop: ms(10) },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: ms(20), paddingTop: ms(14), paddingBottom: ms(14), borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: tokens.border },
    title: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.large, color: tokens.text },
    clearAll: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.small },
    body: { flex: 1, flexDirection: "row" },

    // Left rail: quiet, the active section is a filled brand badge
    rail: { width: ms(56), flexGrow: 0, flexShrink: 0, backgroundColor: tokens.surface, borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: tokens.border },
    tab: { alignItems: "center", justifyContent: "center", gap: ms(2), paddingVertical: ms(7), paddingHorizontal: 0 },
    tabActive: {},
    tabBadge: { width: ms(32), height: ms(32), borderRadius: ms(16), alignItems: "center", justifyContent: "center", backgroundColor: tokens.sunken },
    tabBadgeOn: { backgroundColor: accent.accent },
    tabDot: { position: "absolute", top: ms(5), right: ms(8), width: 9, height: 9, borderRadius: 5, backgroundColor: accent.accent, borderWidth: 1.5, borderColor: tokens.surface, zIndex: 1 },
    tabLabel: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, textAlign: "center", color: tokens.sec },
    tabLabelActive: { fontFamily: fontFamilies.body.bold, color: accent.accent },

    // Right: sections on white, separated by hairlines
    content: { flex: 1, backgroundColor: tokens.surface },
    contentInner: { paddingHorizontal: ms(16), paddingTop: ms(6) },
    card: { paddingVertical: ms(18), borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: tokens.border },
    cardTitle: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.medium, color: tokens.text },
    tiles: { flexDirection: "row", flexWrap: "wrap", gap: ms(10), marginTop: ms(14) },
    tile: { flexDirection: "row", alignItems: "center", gap: ms(6), minHeight: ms(42), paddingHorizontal: ms(16), borderRadius: ms(21), borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.surface },
    tileOn: { borderColor: accent.accent, backgroundColor: accent.accent },
    tileText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.small, color: tokens.text },
    tileTextOn: { color: accent.on },

    sortList: { marginTop: ms(6) },
    option: { flexDirection: "row", alignItems: "center", gap: ms(12), paddingVertical: ms(13) },
    optionText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text, flex: 1 },
    optionTextOn: { color: accent.accent, fontFamily: fontFamilies.body.bold },
    note: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.sec, marginTop: ms(10) },

    // Footer
    footer: { flexDirection: "row", alignItems: "center", gap: ms(12), paddingHorizontal: ms(16), paddingTop: ms(12), borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: tokens.border, backgroundColor: tokens.surface },
    closeBtn: { flex: 1, minHeight: ms(50), borderRadius: ms(25), borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center" },
    closeText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.text },
    showBtn: { flex: 1.4, minHeight: ms(50), borderRadius: ms(25), alignItems: "center", justifyContent: "center" },
    showText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on },

    // Round close button floating above the sheet
    closeWrap: { alignItems: "center", marginBottom: ms(14) },
    closeCircle: { width: ms(40), height: ms(40), borderRadius: ms(20), alignItems: "center", justifyContent: "center", backgroundColor: tokens.text },
  });

export type FilterStyles = ReturnType<typeof createFilterStyles>;
