import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/(tabs)/orders.tsx (My orders). Lives here rather than beside
// the screen because app/ is Expo Router's routing directory and a non-route
// file in there is treated as a route.

export const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 10 },
    headline: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.extraLarge, letterSpacing: -0.3, color: tokens.text },
    headerSub: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, marginTop: 2 },
    filterBtn: {
      width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center",
    },

    chipsRow: { paddingHorizontal: 16, gap: 8 },
    chip: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9, minHeight: 40 },
    chipActive: { backgroundColor: tokens.brand, borderColor: tokens.brand },
    chipText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.sec },
    chipTextActive: { color: tokens.onBrand },

    section: { paddingHorizontal: 16, paddingTop: 22 },
    sectionLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginBottom: 10 },

    // Shared by every row/card: the service icon square.
    iconTile: { width: moderateScale(44), height: moderateScale(44), borderRadius: moderateScale(14), alignItems: "center", justifyContent: "center" },
    thumbImage: { width: "100%", height: "100%" },
    titleWrap: { flex: 1, minWidth: 0 },

    // Active order card (Track order).
    activeCard: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 20, padding: 16, marginBottom: 12 },
    activeTop: { flexDirection: "row", alignItems: "center", gap: 12 },
    activeTitle: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, lineHeight: typography.lineHeights.large, color: tokens.text },
    activeSub: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, marginTop: 2 },
    activePrice: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.large, lineHeight: typography.lineHeights.large, color: tokens.text, alignSelf: "flex-start" },
    liveBox: { marginTop: 14, borderRadius: 16, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 12 },
    liveCaption: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium },
    activeFoot: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14 },
    footLabel: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.muted },
    footAddress: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.text },
    trackPill: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, paddingHorizontal: 16, minHeight: moderateScale(44) },
    trackPillText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium },

    // Past / scheduled rows, grouped in one card.
    listCard: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 20, overflow: "hidden" },
    row: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14 },
    rowDivider: { height: 1, backgroundColor: tokens.border, marginLeft: 14 + moderateScale(44) + 12 },
    rowTitleLine: { flexDirection: "row", alignItems: "center", gap: 8 },
    rowTitle: { flex: 1, fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.text },
    rowMeta: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.sec, marginTop: 3 },
    rowChevron: { alignSelf: "center" },
    statusTag: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
    statusTagText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small },
    rowActions: { flexDirection: "row", alignItems: "center", gap: 18, marginTop: 10 },
    rowAction: { flexDirection: "row", alignItems: "center", gap: 5, minHeight: 28 },
    rowActionText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.sec },

    refundRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginTop: 8 },
    refundText: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small },
    rejectionReason: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.error, marginTop: 6 },

    skeletonCard: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 14, padding: 14 },
    skeletonBar: { backgroundColor: tokens.sunken, borderRadius: 6 },

    emptyWrap: { flex: 1, alignItems: "center", paddingTop: 100, paddingHorizontal: 32 },
    emptyIconCircle: { width: 72, height: 72, borderRadius: 24, backgroundColor: tokens.brandSkin, alignItems: "center", justifyContent: "center", marginBottom: 18 },
    emptyTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.extraLarge, letterSpacing: -0.2, color: tokens.text, textAlign: "center" },
    emptySubtitle: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, textAlign: "center", marginTop: 10, marginBottom: 22 },
    primaryBtn: { width: "100%", borderRadius: 14, minHeight: moderateScale(48), alignItems: "center", justifyContent: "center" },
    primaryBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium },

    sheetOverlay: { flex: 1, justifyContent: "flex-end" },
    sheetScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
    sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: tokens.borderStrong, alignSelf: "center", marginBottom: 18 },
    filterSheet: { backgroundColor: tokens.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, paddingHorizontal: 20, paddingBottom: 24 },
    filterSheetTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.extraLarge, letterSpacing: -0.3, color: tokens.text, marginBottom: 18 },
    filterOptionRow: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, minHeight: 48 },
    checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: tokens.borderStrong, alignItems: "center", justifyContent: "center" },
    filterOptionLabel: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text },
    filterOptionCount: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },
    clearBtn: { flex: 1, borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 14, minHeight: moderateScale(52), alignItems: "center", justifyContent: "center" },
    clearBtnText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.sec },
    showBtn: { flex: 1, borderRadius: 14, minHeight: moderateScale(52), alignItems: "center", justifyContent: "center" },
    showBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium },

    reviewOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
    reviewCard: { width: "100%", borderRadius: 18, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.surface, padding: 20 },
    reviewTitle: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, color: tokens.text },
    reviewTagChip: { borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
    reviewTagText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.text },
    reviewInput: { borderWidth: 1, borderColor: tokens.border, borderRadius: 12, padding: 12, minHeight: 60, fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, color: tokens.text, textAlignVertical: "top" },
    reviewCancelBtn: { flex: 1, borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 12, paddingVertical: 13, alignItems: "center" },
    reviewCancelBtnText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.sec },
    reviewSubmitBtn: { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: "center" },
    reviewSubmitBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium },
  });

/** Exact shape of this feature's stylesheet, for components that take it as a prop. */
export type OrdersStyles = ReturnType<typeof createStyles>;
