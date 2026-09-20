import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/restaurant-menu.tsx. Moved out of the screen unchanged -- every value
// is exactly as it was, so nothing renders differently. Lives here rather
// than beside the screen because app/ is Expo Router's routing directory
// and a non-route file in there is treated as a route.

export const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["food"]) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: tokens.bg },
    heroOverlay: {
      position: "absolute", left: 16, right: 16, zIndex: 20,
      flexDirection: "row", justifyContent: "space-between",
    },
    circleBtn: {
      width: moderateScale(38), height: moderateScale(38), borderRadius: moderateScale(19),
      backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center",
    },
    solidHeader: {
      position: "absolute", left: 0, right: 0, zIndex: 20,
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: 12, paddingBottom: 10,
      backgroundColor: tokens.surface, borderBottomWidth: 1, borderBottomColor: tokens.border,
    },
    solidHeaderBtn: {
      width: moderateScale(38), height: moderateScale(38), borderRadius: moderateScale(19),
      alignItems: "center", justifyContent: "center",
    },
    solidHeaderTitle: { flex: 1, textAlign: "center", fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, color: tokens.text },

    fixedTabsBar: { position: "absolute", left: 0, right: 0, zIndex: 19, backgroundColor: tokens.bg, borderBottomWidth: 1, borderBottomColor: tokens.border },
    inlineTabsBar: { backgroundColor: tokens.bg },

    heroImage: { width: "100%", height: moderateScale(190), backgroundColor: tokens.sunken },
    sheet: { backgroundColor: tokens.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, paddingTop: 18, paddingHorizontal: 16 },
    titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    name: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.extraLarge, letterSpacing: -0.3, color: tokens.text },
    metaLine: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 5 },
    ratingPill: { backgroundColor: tokens.success, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, alignItems: "center" },
    ratingPillValue: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: "#fff" },
    ratingPillCount: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: "#fff", opacity: 0.9, marginTop: 1 },

    vegRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 18 },
    vegLeft: { flexDirection: "row", alignItems: "center", gap: 9 },
    vegIconBox: { width: 16, height: 16, borderWidth: 1.5, borderColor: tokens.veg, borderRadius: 3, alignItems: "center", justifyContent: "center" },
    vegDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: tokens.veg },
    vegLabel: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    vegSwitch: { width: moderateScale(52), height: moderateScale(30), borderRadius: 999, backgroundColor: tokens.border, padding: 3 },
    vegSwitchKnob: { width: moderateScale(24), height: moderateScale(24), borderRadius: 999, backgroundColor: tokens.surface },

    searchRow: {
      flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16,
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border,
      borderRadius: 14, height: moderateScale(46), paddingHorizontal: 14,
    },
    searchInput: { flex: 1, fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, color: tokens.text },

    tabsScrollContent: { paddingHorizontal: 16, gap: 20, alignItems: "center" },
    tabItem: { paddingVertical: 12, alignItems: "center" },
    tabText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },
    tabTextActive: { fontFamily: fontFamilies.body.bold, color: tokens.text },
    tabActiveMark: { marginTop: 6, width: 18, height: 2.5, borderRadius: 999, backgroundColor: accent.accent },

    emptyMenu: { marginTop: 80, alignItems: "center", gap: 10 },
    emptyText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.sec },

    categorySection: { paddingHorizontal: 16, paddingTop: 22 },
    categoryHeadRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginBottom: 14 },
    categoryTitle: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, letterSpacing: -0.1, color: tokens.text },
    categoryCount: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },

    menuRow: { flexDirection: "row", gap: 14, paddingBottom: 16 },
    menuRowDivider: { borderBottomWidth: 1, borderBottomColor: tokens.border, marginBottom: 16 },
    menuRowHighlighted: { backgroundColor: accent.skin, borderRadius: 12, padding: 8, marginHorizontal: -8 },
    rowInfo: { flex: 1, minWidth: 0 },
    dietIcon: { width: 16, height: 16, borderWidth: 1.5, borderRadius: 3, alignItems: "center", justifyContent: "center", marginBottom: 6 },
    vegDotSmall: { width: 7, height: 7, borderRadius: 4 },
    nonvegTriangle: { width: 0, height: 0, borderLeftWidth: 3.5, borderRightWidth: 3.5, borderBottomWidth: 6, borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: tokens.nonveg },
    rowName: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, letterSpacing: -0.1, lineHeight: typography.lineHeights.large, color: tokens.text },
    rowPrice: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 4 },
    rowDesc: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, marginTop: 6 },
    rowImageCol: { width: moderateScale(98), flexShrink: 0, alignItems: "center", gap: 8 },
    rowImage: { width: moderateScale(98), height: moderateScale(88), borderRadius: 8, backgroundColor: tokens.sunken },
    addBtn: {
      width: moderateScale(98), minHeight: moderateScale(34), borderRadius: 12,
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: accent.accent,
      alignItems: "center", justifyContent: "center",
    },
    addBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.accent },
    qtyPill: {
      width: moderateScale(98), minHeight: moderateScale(34), borderRadius: 12,
      backgroundColor: accent.skin, borderWidth: 1, borderColor: accent.accent,
      flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8,
    },
    qtyBtn: { width: 24, height: 24, alignItems: "center", justifyContent: "center" },
    qtyText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.accent },
    soldOutBadge: { backgroundColor: tokens.sunken, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
    soldOutText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: tokens.sec, textTransform: "uppercase", letterSpacing: 0.4 },

    modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalSheet: { backgroundColor: tokens.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden" },
    modalImage: { width: "100%", height: 240, backgroundColor: tokens.sunken },
    modalCloseBtn: {
      position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: 18,
      backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center",
    },
    modalContent: { padding: 20, paddingBottom: 28 },
    modalHeadRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
    modalTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.extraLarge, letterSpacing: -0.2, color: tokens.text },
    modalPrice: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 4 },
    modalFavoriteBtn: { padding: 4 },
    modalDesc: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, marginTop: 12 },
    modalSoldOut: { marginTop: 18, alignSelf: "flex-start", backgroundColor: tokens.sunken, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
    modalAddBtn: { marginTop: 18, backgroundColor: accent.accent, borderRadius: 14, paddingVertical: 15, alignItems: "center" },
    modalAddBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on },
    modalQtyRow: {
      marginTop: 18, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 16,
      backgroundColor: accent.skin, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12,
    },
    modalQtyBtn: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
    modalQtyText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.large, color: accent.accent },
  });

/** Exact shape of this screen's stylesheet, for components that take it as a prop. */
export type RestaurantMenuStyles = ReturnType<typeof createStyles>;
