import { StyleSheet } from "react-native";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for the support bot section on app/support.tsx.

export const createBotStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    chipRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
    card: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 16, overflow: "hidden", marginHorizontal: 16 },
    row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
    rowDivider: { borderBottomWidth: 1, borderBottomColor: tokens.border },
    question: { flex: 1, fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    helped: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.muted, marginTop: 3 },

    answerCard: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 16, padding: 14, marginHorizontal: 16, gap: 12 },
    answerQuestion: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.text },
    answerText: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec },
    answerBubble: { backgroundColor: tokens.sunken, borderRadius: 12, padding: 12, gap: 8 },
    orderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
    orderText: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.muted },
    changeText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: tokens.brand },
    orderOption: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, borderTopWidth: 1, borderTopColor: tokens.border },
    orderOptionSelected: { backgroundColor: tokens.brandSkin },
    orderOptionText: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text },
    orderOptionMeta: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.muted },
    feedbackLabel: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    feedbackRow: { flexDirection: "row", gap: 10 },
    feedbackBtn: { flex: 1 },
    thanks: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.success },
    note: { backgroundColor: tokens.warningSkin, borderRadius: 12, padding: 12 },
    noteText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.warning },
    back: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 16, paddingBottom: 10 },
    backText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.brand },
    empty: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, color: tokens.sec, paddingHorizontal: 16 },
  });

export type BotStyles = ReturnType<typeof createBotStyles>;
