import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { CARD_GAP, CARD_W } from "./constants";

// Part of the home.styles stylesheet, kept under the 150-line file limit.
// Values are unchanged; home.styles.ts composes this back together.

export const createRootStyles = (tokens: ThemeTokens, accent: ServiceTokens) =>
  StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.bg },
  mainScrollContent: { paddingBottom: 100 },

  topRow: {
    flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 6,
  },
  addressBlock: { flex: 1, minWidth: 0 },
  addressEyebrow: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: accent.accent },
  addressLabelRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 5 },
  addressLabel: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, color: tokens.text },
  addressLine: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 3 },
  topRowActions: { flexDirection: "row", gap: 10 },
  iconBtnCircle: {
    width: moderateScale(44), height: moderateScale(44), borderRadius: moderateScale(22),
    backgroundColor: tokens.sunken, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center",
  },
  avatarBtn: {
    width: moderateScale(44), height: moderateScale(44), borderRadius: moderateScale(22),
    backgroundColor: tokens.sunken, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute", top: -2, right: -2, minWidth: moderateScale(16), height: moderateScale(16),
    borderRadius: moderateScale(8), backgroundColor: tokens.error, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 3, borderWidth: 1.5, borderColor: tokens.bg,
  },
  notificationBadgeText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: "#fff" },

  headline: {
    fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.extraLarge, lineHeight: typography.lineHeights.extraLarge,
    letterSpacing: -0.6, color: tokens.text, paddingHorizontal: 16, marginTop: 18,
  },

  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: tokens.surface,
    borderWidth: 1, borderColor: accent.accent, borderRadius: moderateScale(14), height: moderateScale(48),
    paddingHorizontal: 14, marginHorizontal: 16, marginTop: 14,
  },
  searchPlaceholder: { flex: 1, fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, color: tokens.sec },

  tilesRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginTop: 16, alignItems: "stretch" },
  togglePill: { flex: 1, flexDirection: "row", gap: 4, backgroundColor: accent.skin, borderRadius: moderateScale(22), padding: 4 },
  toggleCell: { flex: 1, borderRadius: moderateScale(18), borderWidth: 1.5, borderColor: "transparent", paddingVertical: 9, alignItems: "center", gap: 7 },
  launcherTile: {
    flex: 1, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: moderateScale(20),
    paddingVertical: 10, alignItems: "center", gap: 7, position: "relative",
  },
  launcherArrow: { position: "absolute", top: 6, right: 8, fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: tokens.sec },
  toggleIconCircle: { width: moderateScale(32), height: moderateScale(32), borderRadius: moderateScale(11), alignItems: "center", justifyContent: "center" },
  toggleEmoji: { fontSize: typography.sizes.medium },
  // Ride/Task carry a permanent skin tint, so the slack around a 15pt emoji in
  // the 32pt toggle circle showed up as an oversized empty box. Tighter frame,
  // bigger glyph — the icon fills ~63% of it instead of ~47%.
  launcherIconCircle: { width: moderateScale(30), height: moderateScale(30), borderRadius: moderateScale(10), alignItems: "center", justifyContent: "center" },
  launcherEmoji: { fontSize: typography.sizes.large, lineHeight: typography.lineHeights.large, textAlign: "center", includeFontPadding: false },
  toggleLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: tokens.sec },

  promoSection: { marginTop: 20 },
  promoScrollContent: { paddingHorizontal: 16, gap: CARD_GAP },
  promoCard: { width: CARD_W, height: 140, borderRadius: moderateScale(18), borderWidth: 1, borderColor: tokens.border, padding: 18, justifyContent: "space-between" },
  promoEyebrow: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase" },
  promoHeadline: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.extraLarge, lineHeight: typography.lineHeights.extraLarge, letterSpacing: -0.5, color: tokens.text, marginTop: 8 },
  promoCaption: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },
  promoDotsRow: { flexDirection: "row", justifyContent: "center", gap: 5, paddingTop: 12 },
  promoDot: { height: 5, borderRadius: 999 },

  adCard: { marginHorizontal: 16, marginTop: 16, borderRadius: moderateScale(16), overflow: "hidden", borderWidth: 1, borderColor: tokens.border },
  adImage: { width: "100%", height: 140 },
  adCaption: { padding: 12, backgroundColor: tokens.surface },
  adTitle: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.text },
  adDescription: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.sec, marginTop: 2 },

  sectionBlock: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeadRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionHeadLeft: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  sectionTitle: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, letterSpacing: -0.1, color: tokens.text },
  sectionMeta: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },
  sectionSeeAll: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: accent.accent },
  mealsScrollContent: { gap: 12 },

  mealCard: { width: 132 },
  mealImageWrap: { position: "relative" },
  mealImage: { width: 132, height: 96, borderRadius: moderateScale(8), backgroundColor: tokens.sunken },
  mealPriceBadge: { position: "absolute", top: 6, left: 6, backgroundColor: accent.accent, borderRadius: moderateScale(5), paddingHorizontal: 6, paddingVertical: 3 },
  mealPriceBadgeText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 0.5, color: accent.on },
  mealAddBtn: {
    position: "absolute", bottom: -10, right: 6, width: moderateScale(26), height: moderateScale(26), borderRadius: moderateScale(13),
    backgroundColor: accent.accent, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: tokens.bg,
  },
  mealAddBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: accent.on },
  mealName: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text, marginTop: 8 },
  mealVendor: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 2 },

  vegOnlyRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginTop: 22 },
  vegOnlyLeft: { flexDirection: "row", alignItems: "center", gap: 9 },
  vegOnlyIcon: { width: moderateScale(16), height: moderateScale(16), borderWidth: 1.5, borderColor: tokens.veg, borderRadius: moderateScale(3), alignItems: "center", justifyContent: "center" },
  vegOnlyDot: { width: moderateScale(7), height: moderateScale(7), borderRadius: moderateScale(3.5), backgroundColor: tokens.veg },
  vegOnlyLabel: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
  vegSwitchTrack: { width: moderateScale(52), height: moderateScale(30), borderRadius: 999, backgroundColor: tokens.sunken, padding: 3, justifyContent: "center" },
  vegSwitchThumb: { width: moderateScale(24), height: moderateScale(24), borderRadius: 999, backgroundColor: tokens.surface },

  chipsScrollContent: { paddingHorizontal: 16, gap: 8, marginTop: 16 },
  chip: {
    flexDirection: "row", alignItems: "center", backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.borderStrong,
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9,
  },
  chipActive: { backgroundColor: accent.accent, borderColor: accent.accent },
  chipText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },
  chipTextActive: { color: accent.on, fontFamily: fontFamilies.body.semibold },
  chipFilled: { backgroundColor: accent.accent, borderColor: accent.accent },
  chipFilledText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: accent.on },
  });
