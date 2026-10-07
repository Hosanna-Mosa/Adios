import { StyleSheet, Platform } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Part of the home.styles stylesheet, kept under the 150-line file limit.
// Values are unchanged; home.styles.ts composes this back together.

export const createChipBadgeStyles = (tokens: ThemeTokens, accent: ServiceTokens) =>
  StyleSheet.create({
  chipBadge: { marginLeft: 6, minWidth: moderateScale(16), height: moderateScale(16), borderRadius: moderateScale(8), backgroundColor: accent.on, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 },
  chipBadgeText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: accent.accent },
  chipVegDot: { width: moderateScale(8), height: moderateScale(8), borderRadius: moderateScale(4), backgroundColor: tokens.veg, marginRight: 6 },

  cuisineSection: { marginTop: 22 },
  cuisineLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: accent.accent, paddingHorizontal: 16, marginBottom: 12 },
  cuisineScrollContent: { paddingHorizontal: 16, gap: 16 },
  cuisineItem: { width: 64, alignItems: "center" },
  cuisineCircle: { width: 64, height: 64, borderRadius: 999, overflow: "hidden", backgroundColor: tokens.sunken, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center" },
  cuisineImage: { width: "100%", height: "100%", borderRadius: 999 },
  cuisineName: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.small, color: tokens.text, marginTop: 7, textAlign: "center" },

  listHeadingBlock: { paddingHorizontal: 16, marginTop: 26, marginBottom: 12 },
  listHeading: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.extraLarge, letterSpacing: -0.3, color: tokens.text },
  listHeadingMeat: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.large, lineHeight: typography.lineHeights.large, letterSpacing: -0.3, color: tokens.text },
  listHeadingMeta: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 2 },

  listSectionHeader: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1.2, textTransform: "uppercase", color: accent.accent, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },

  stickyHeader: {
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, backgroundColor: tokens.surface,
    borderBottomWidth: 1, borderBottomColor: tokens.border, paddingBottom: 10,
  },
  stickyRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  stickyAddress: { flex: 1, fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text, marginRight: 8 },
  stickyActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  stickyTogglePill: { flexDirection: "row", gap: 3, backgroundColor: accent.skin, borderRadius: 999, padding: 3 },
  stickyToggleCell: { width: moderateScale(28), height: moderateScale(28), borderRadius: 999, alignItems: "center", justifyContent: "center" },
  stickyToggleEmoji: { fontSize: typography.sizes.medium },
  stickyIconBtn: { width: moderateScale(30), height: moderateScale(30), borderRadius: 999, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center" },

  emptyIconCircle: {
    width: moderateScale(60), height: moderateScale(60), borderRadius: moderateScale(20),
    backgroundColor: tokens.sunken, alignItems: "center", justifyContent: "center",
  },

  emptySearchContainer: { alignItems: "center", justifyContent: "center", paddingTop: 40, paddingHorizontal: 28 },
  emptySearchTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.large, letterSpacing: -0.3, color: tokens.text, marginTop: 18, textAlign: "center" },
  emptySearchSubtitle: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, textAlign: "center", marginTop: 8 },
  tryInsteadLabel: {
    alignSelf: "flex-start", fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1,
    textTransform: "uppercase", color: tokens.muted, marginTop: 20, marginBottom: 10,
  },
  tryInsteadRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tryInsteadChip: { borderWidth: 1, borderColor: tokens.borderStrong, backgroundColor: tokens.surface, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  tryInsteadChipText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },

  noServiceContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 44, paddingHorizontal: 28 },
  noServiceTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.large, letterSpacing: -0.3, color: tokens.text, marginTop: 18, textAlign: "center" },
  noServiceSubtitle: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, color: tokens.sec, textAlign: "center", marginTop: 8, lineHeight: typography.lineHeights.medium },
  noServiceButton: { marginTop: 22, width: "100%", alignItems: "center", paddingVertical: 15, borderRadius: moderateScale(14), backgroundColor: accent.accent },
  noServiceButtonDisabled: { opacity: 0.6 },
  noServiceButtonText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on },
  noServiceSecondaryButton: { marginTop: 10, width: "100%", alignItems: "center", paddingVertical: 14, borderRadius: moderateScale(14), borderWidth: 1, borderColor: tokens.borderStrong, backgroundColor: tokens.surface },
  noServiceSecondaryButtonText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: accent.accent },

  dishMenuItem: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: tokens.surface, borderBottomWidth: 1, borderBottomColor: tokens.border },
  dishItemInfo: { flex: 1, paddingRight: 16 },
  dishItemTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dishVegIndicator: { borderWidth: 1, width: moderateScale(14), height: moderateScale(14), alignItems: "center", justifyContent: "center", borderRadius: moderateScale(2) },
  dishVegDot: { width: moderateScale(6), height: moderateScale(6), borderRadius: moderateScale(3) },
  dishItemName: { flex: 1, fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.text },
  dishItemPrice: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text, marginTop: 4 },
  dishItemDesc: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec, marginTop: 4, lineHeight: typography.lineHeights.small },
  dishVendorRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 4 },
  dishVendorText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec },
  dishItemImageContainer: { width: 90, height: 90, position: "relative" },
  dishItemImage: { width: 90, height: 90, borderRadius: moderateScale(12), backgroundColor: tokens.sunken },
  dishAddButtonOverlay: { position: "absolute", bottom: -8, left: 8, right: 8, alignItems: "center" },
  dishAddPill: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.borderStrong, paddingHorizontal: 16, paddingVertical: 5, borderRadius: moderateScale(8), minWidth: 70, alignItems: "center" },
  dishAddPillText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: accent.accent },
  dishSoldOutPill: { backgroundColor: tokens.sunken, borderWidth: 1, borderColor: tokens.border, paddingHorizontal: 16, paddingVertical: 5, borderRadius: moderateScale(8), minWidth: 70, alignItems: "center" },
  dishSoldOutPillText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: tokens.muted },
  dishQuantityPill: { flexDirection: "row", alignItems: "center", backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: moderateScale(8), paddingHorizontal: 4, paddingVertical: 4, gap: 8 },
  dishQtyActionBtn: { paddingHorizontal: 4, paddingVertical: 2 },
  dishQtyText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: tokens.text },

  searchSheet: { backgroundColor: tokens.bg, borderBottomLeftRadius: moderateScale(24), borderBottomRightRadius: moderateScale(24), overflow: "hidden" },
  searchSheetHeaderRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 16 },
  searchSheetHeaderText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },
  searchSheetInputRow: { paddingHorizontal: 16, paddingBottom: 16 },
  searchSheetInputWrap: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: tokens.surface, borderWidth: 1, borderColor: accent.accent, borderRadius: moderateScale(14), paddingHorizontal: 14, paddingVertical: Platform.OS === "ios" ? 13 : 9 },
  searchSheetInput: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text },
  searchSectionHeadRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  searchSectionTitle: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, color: tokens.muted },
  searchClearLink: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.small, color: accent.accent },
  searchSuggestChip: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: tokens.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  searchSuggestChipText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },

  distanceModalOverlay: { flex: 1, justifyContent: "flex-end" },
  distanceModalScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  distanceSheet: { backgroundColor: tokens.surface, borderTopLeftRadius: moderateScale(26), borderTopRightRadius: moderateScale(26), paddingHorizontal: 20, paddingTop: 10 },
  distanceSheetHandle: { width: moderateScale(42), height: moderateScale(4), borderRadius: moderateScale(2), backgroundColor: tokens.borderStrong, alignSelf: "center", marginBottom: 18 },
  distanceSheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  distanceTitle: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.large, color: tokens.text },
  distanceSubtitle: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec, marginTop: 3 },
  distanceCloseBtn: { width: moderateScale(34), height: moderateScale(34), borderRadius: moderateScale(17), backgroundColor: tokens.sunken, alignItems: "center", justifyContent: "center" },
  distancePresetRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  distanceChip: { minWidth: 68, alignItems: "center", justifyContent: "center", paddingHorizontal: 14, paddingVertical: 10, borderRadius: moderateScale(18), backgroundColor: tokens.sunken, borderWidth: 1, borderColor: tokens.border },
  distanceChipActive: { backgroundColor: accent.accent, borderColor: accent.accent },
  distanceChipText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.text },
  distanceChipTextActive: { color: accent.on },
  distanceInputWrap: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: moderateScale(18), borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.sunken, paddingHorizontal: 14, marginBottom: 16 },
  distanceInput: { flex: 1, paddingVertical: Platform.OS === "ios" ? 14 : 10, color: tokens.text, fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium },
  distanceInputUnit: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.sec },
  distanceApplyBtn: { alignItems: "center", justifyContent: "center", paddingVertical: 15, borderRadius: moderateScale(18), backgroundColor: accent.accent },
  });
