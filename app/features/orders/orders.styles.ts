import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/(tabs)/orders.tsx. Moved out of the screen unchanged -- every value
// is exactly as it was, so nothing renders differently. Lives here rather
// than beside the screen because app/ is Expo Router's routing directory
// and a non-route file in there is treated as a route.

export const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 10 },
    headline: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.extraLarge, letterSpacing: -0.3, color: tokens.text },
    filterBtn: {
      width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center",
    },

    chipsRow: { paddingHorizontal: 16, gap: 8 },
    chip: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9, minHeight: 40 },
    chipActive: { backgroundColor: tokens.text, borderColor: tokens.text },
    chipText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.sec },
    chipTextActive: { color: tokens.bg },

    section: { paddingHorizontal: 16, paddingTop: 22 },
    sectionLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginBottom: 10 },

    card: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 14, padding: 14 },
    cardEyebrow: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase" },
    cardTitle: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, letterSpacing: -0.1, color: tokens.text, marginTop: 6 },
    cardMeta: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 4 },
    cardMetaRight: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec },

    liveRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    liveDot: { width: 8, height: 8, marginLeft: "auto", marginRight: 0 },
    liveDotCore: { width: 8, height: 8, borderRadius: 4 },
    liveLabel: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.small },
    cancelledBadge: { backgroundColor: tokens.errorSkin, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
    cancelledBadgeText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 0.5, textTransform: "uppercase", color: tokens.error },
    schedulePill: { marginLeft: "auto", backgroundColor: tokens.warningSkin, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
    schedulePillText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 0.5, textTransform: "uppercase", color: tokens.warning },
    rejectionReason: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.error, marginTop: 6 },

    actionRow: { flexDirection: "row", gap: 8, marginTop: 12 },
    actionBtnFilled: { flex: 1, borderWidth: 1, borderRadius: 10, minHeight: 40, alignItems: "center", justifyContent: "center" },
    actionBtnFilledText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium },
    actionBtnOutline: { flex: 1, borderWidth: 1, borderColor: tokens.borderStrong, backgroundColor: tokens.surface, borderRadius: 10, minHeight: 40, alignItems: "center", justifyContent: "center" },
    actionBtnOutlineText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.sec },
    trackBtn: { marginTop: 12, borderRadius: 12, minHeight: 44, alignItems: "center", justifyContent: "center" },
    trackBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium },

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
