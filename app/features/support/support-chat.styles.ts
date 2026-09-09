import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/support-chat.tsx. Moved out of the screen unchanged -- every value
// is exactly as it was, so nothing renders differently. Lives here rather
// than beside the screen because app/ is Expo Router's routing directory
// and a non-route file in there is treated as a route.

export const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["food"]) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: tokens.bg },
    center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: tokens.bg },
    loadingText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 12 },

    header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 14, backgroundColor: tokens.surface, borderBottomWidth: 1, borderBottomColor: tokens.border },
    backBtn: { width: moderateScale(38), height: moderateScale(38), borderRadius: moderateScale(19), backgroundColor: tokens.bg, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center" },
    headerName: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, color: tokens.text },
    headerStatus: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec, marginTop: 2 },

    sectionLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginHorizontal: 16, marginTop: 22, marginBottom: 12 },

    caseCard: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderLeftWidth: 3, borderRadius: 14, padding: 14 },
    caseTopRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    caseEyebrow: { flex: 1, fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase" },
    caseStatusPill: { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
    caseStatusPillText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 0.5, textTransform: "uppercase" },
    caseTitle: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    caseMeta: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 4 },
    caseActionRow: { flexDirection: "row", gap: 8, marginTop: 12 },
    caseActionOutline: { flex: 1, borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 10, minHeight: 40, alignItems: "center", justifyContent: "center" },
    caseActionOutlineText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.sec },
    caseActionFilled: { flex: 1, borderWidth: 1, borderRadius: 10, minHeight: 40, alignItems: "center", justifyContent: "center" },
    caseActionFilledText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium },

    formCard: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 18, padding: 16, marginHorizontal: 16 },
    formLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginBottom: 8 },
    categoryChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
    categoryChipText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium },
    formInput: { borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 12, minHeight: 48, paddingHorizontal: 14, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text },
    formTextArea: { borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 12, minHeight: 84, paddingHorizontal: 14, paddingTop: 12, fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, color: tokens.text },

    submitBtn: { borderRadius: 14, minHeight: moderateScale(52), alignItems: "center", justifyContent: "center", marginHorizontal: 16, marginTop: 18 },
    submitBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium },

    messagesFlatList: { flex: 1 },
    messagesList: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, gap: 10 },
    systemMessageText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.small, textTransform: "uppercase", letterSpacing: 1, color: tokens.muted },
    messageRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
    avatar: { width: 24, height: 24, borderRadius: 8, backgroundColor: tokens.sunken, alignItems: "center", justifyContent: "center", marginBottom: 2 },
    bubble: { maxWidth: "78%", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, gap: 4 },
    bubbleText: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium },
    bubbleTime: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, alignSelf: "flex-end", marginTop: 2 },

    inputBar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingTop: 12, backgroundColor: tokens.surface, borderTopWidth: 1, borderTopColor: tokens.border },
    inputContainer: { flex: 1, backgroundColor: tokens.bg, borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 22, minHeight: moderateScale(44), maxHeight: 100, paddingHorizontal: 16, justifyContent: "center" },
    textInput: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, color: tokens.text, paddingVertical: 10 },
    sendBtn: { width: moderateScale(44), height: moderateScale(44), borderRadius: moderateScale(22), alignItems: "center", justifyContent: "center" },

    resolvedNotice: { alignItems: "center", justifyContent: "center", paddingVertical: 18, paddingHorizontal: 24, gap: 8, backgroundColor: tokens.surface, borderTopWidth: 1, borderTopColor: tokens.border },
    resolvedText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, textAlign: "center" },
    reopenBtn: { borderWidth: 1.5, borderColor: accent.accent, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 9 },
    reopenBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium },

    resolveOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center", padding: 32 },
    resolveCard: { backgroundColor: tokens.surface, borderRadius: 20, padding: 22, width: "100%" },
    resolveTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.extraLarge, lineHeight: typography.lineHeights.extraLarge, letterSpacing: -0.3, color: tokens.text },
    resolveSub: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, marginTop: 10, marginBottom: 20 },
    resolveNotYetBtn: { flex: 1, borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 14, minHeight: 48, alignItems: "center", justifyContent: "center" },
    resolveNotYetText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.sec },
    resolveYesBtn: { flex: 1, borderRadius: 14, minHeight: 48, alignItems: "center", justifyContent: "center" },
    resolveYesText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium },
  });
