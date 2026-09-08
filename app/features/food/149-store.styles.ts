import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";

// Styles for app/149-store.tsx. Moved out of the screen unchanged -- every value
// is exactly as it was, so nothing renders differently. Lives here rather
// than beside the screen because app/ is Expo Router's routing directory
// and a non-route file in there is treated as a route.

export const createStyles = (tokens: ThemeTokens, accent: ServiceTokens) => StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.bg },

  heroHeader: { backgroundColor: accent.accent, paddingHorizontal: 16, paddingBottom: 22 },
  backBtn: {
    width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
    backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  heroEyebrow: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(11), letterSpacing: 1.4, textTransform: "uppercase", color: accent.on, opacity: 0.8 },
  heroHeadline: { fontFamily: fontFamilies.heading.bold, fontSize: moderateScale(40), lineHeight: moderateScale(40), letterSpacing: -1.4, color: accent.on, marginTop: 10 },
  heroLocationRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
  heroLocationText: { flexShrink: 1, fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(13), color: accent.on, opacity: 0.95 },
  heroSubtext: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(14), color: accent.on, opacity: 0.85, marginTop: 8 },

  sheet: { backgroundColor: tokens.bg, borderRadius: 24, marginTop: -14, paddingTop: 16, paddingHorizontal: 16 },
  categoryScrollContent: { gap: 8, paddingBottom: 16 },
  categoryChip: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  categoryChipActive: { backgroundColor: accent.accent, borderColor: accent.accent },
  categoryChipText: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(13), color: tokens.sec },
  categoryChipTextActive: { color: accent.on, fontFamily: fontFamilies.body.semibold },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: { width: "47.5%", backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: moderateScale(18), overflow: "hidden" },
  cardImageWrap: { height: 104, backgroundColor: tokens.sunken },
  cardImage: { width: "100%", height: "100%" },
  cardBody: { padding: 12 },
  cardMetaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardRating: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(12), color: tokens.sec },
  cardName: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(15), color: tokens.text, marginTop: 5 },
  cardBrand: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(13), color: tokens.sec, marginTop: 3 },
  cardPriceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  cardPrice: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(15), color: tokens.text },
  cardOriginalPrice: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(12), color: tokens.sec, textDecorationLine: "line-through" },
  addBtn: { width: moderateScale(32), height: moderateScale(32), borderRadius: moderateScale(10), backgroundColor: accent.accent, alignItems: "center", justifyContent: "center" },
  qtyPill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: tokens.sunken, borderRadius: moderateScale(10), paddingHorizontal: 6, paddingVertical: 4 },
  qtyBtn: { padding: 3 },
  qtyText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(12), color: tokens.text },

  emptyState: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 12 },
  emptyStateTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: moderateScale(18), color: tokens.text, textAlign: "center" },
  emptyStateText: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(14), lineHeight: moderateScale(20), color: tokens.sec, textAlign: "center", marginTop: 8 },
  emptyStateBtn: { marginTop: 18, backgroundColor: accent.accent, borderRadius: moderateScale(14), paddingHorizontal: 22, paddingVertical: 13 },
  emptyStateBtnText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(14), color: accent.on },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheetModal: { backgroundColor: tokens.surface, borderTopLeftRadius: moderateScale(24), borderTopRightRadius: moderateScale(24), paddingBottom: 32 },
  sheetCloseBtn: {
    position: "absolute", top: -22, alignSelf: "center", width: moderateScale(44), height: moderateScale(44), borderRadius: moderateScale(22),
    backgroundColor: tokens.text, alignItems: "center", justifyContent: "center", zIndex: 10,
  },
  sheetImage: { width: "100%", height: moderateScale(220), borderTopLeftRadius: moderateScale(24), borderTopRightRadius: moderateScale(24) },
  sheetInfo: { padding: 20 },
  sheetRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  sheetVegLabel: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(13), color: tokens.sec },
  sheetAddBtn: { backgroundColor: accent.accent, borderRadius: 999, paddingHorizontal: 24, paddingVertical: 10 },
  sheetAddBtnText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(14), color: accent.on },
  sheetQtyPill: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderColor: accent.accent, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  sheetQtyText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(14), color: accent.accent },
  sheetTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: moderateScale(20), color: tokens.text, marginBottom: 6 },
  sheetPrice: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(18), color: tokens.text },
  sheetRating: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(13), color: tokens.sec, marginTop: 8 },
  sheetDescription: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(14), lineHeight: moderateScale(20), color: tokens.sec, marginTop: 10 },
});
