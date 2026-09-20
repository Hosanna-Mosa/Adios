import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Part of the home.styles stylesheet, kept under the 150-line file limit.
// Values are unchanged; home.styles.ts composes this back together.

export const createDistanceApplyTextStyles = (tokens: ThemeTokens, accent: ServiceTokens) =>
  StyleSheet.create({
  distanceApplyText: { fontFamily: fontFamilies.body.bold, color: accent.on, fontSize: typography.sizes.medium },
  distanceClearBtn: { alignItems: "center", justifyContent: "center", paddingVertical: 13, marginTop: 10, borderRadius: moderateScale(18), borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.surface },
  distanceClearText: { fontFamily: fontFamilies.body.bold, color: tokens.sec, fontSize: typography.sizes.medium },

  startupAdOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 24 },
  startupAdCard: { width: "90%", maxWidth: 340, backgroundColor: tokens.surface, borderRadius: moderateScale(18), overflow: "hidden", position: "relative" },
  startupAdCloseBtn: { position: "absolute", top: 12, right: 12, zIndex: 10, backgroundColor: tokens.surface, padding: 6, borderRadius: 14 },
  startupAdImage: { width: "100%", height: 200 },
  startupAdTitle: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.large, color: tokens.text, marginBottom: 6 },
  startupAdDescription: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, color: tokens.sec, lineHeight: typography.lineHeights.medium },
  startupAdBtn: { backgroundColor: accent.accent, paddingVertical: 12, borderRadius: moderateScale(12), alignItems: "center", marginTop: 16 },
  startupAdBtnText: { fontFamily: fontFamilies.body.bold, color: accent.on, fontSize: typography.sizes.medium },

  filterModalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  filterModalScrim: { ...StyleSheet.absoluteFillObject },
  filterModalContent: { backgroundColor: tokens.surface, borderTopLeftRadius: moderateScale(24), borderTopRightRadius: moderateScale(24), height: "75%", overflow: "hidden" },
  filterModalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: tokens.border },
  filterModalTitle: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.large, color: tokens.text },
  filterModalCloseBtn: { padding: 4 },
  filterModalBody: { flex: 1, flexDirection: "row" },
  filterModalLeftPane: { width: "35%", backgroundColor: tokens.sunken, borderRightWidth: 1, borderRightColor: tokens.border },
  filterModalRightPane: { width: "65%", backgroundColor: tokens.surface },
  filterTabButton: { paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: tokens.border, position: "relative" },
  filterTabButtonActive: { backgroundColor: tokens.surface },
  filterTabText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },
  filterTabTextActive: { color: accent.accent, fontFamily: fontFamilies.body.bold },
  filterTabIndicator: { position: "absolute", left: 0, top: 12, bottom: 12, width: 4, backgroundColor: accent.accent, borderTopRightRadius: 2, borderBottomRightRadius: 2 },
  filterSectionTitle: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 0.8, color: tokens.muted, marginBottom: 16 },
  filterOptionRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 12 },
  filterOptionLabel: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },
  filterEmptyNote: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.muted, fontStyle: "italic", marginTop: 10 },
  filterModalFooter: { flexDirection: "row", padding: 16, borderTopWidth: 1, borderTopColor: tokens.border, justifyContent: "space-between", alignItems: "center", backgroundColor: tokens.surface },
  filterModalClearBtn: { paddingVertical: 12, paddingHorizontal: 16 },
  filterModalClearText: { fontFamily: fontFamilies.body.bold, color: tokens.sec, fontSize: typography.sizes.medium },
  filterModalApplyBtn: { backgroundColor: accent.accent, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 999 },
  filterModalApplyText: { fontFamily: fontFamilies.body.bold, color: accent.on, fontSize: typography.sizes.medium },
  });
