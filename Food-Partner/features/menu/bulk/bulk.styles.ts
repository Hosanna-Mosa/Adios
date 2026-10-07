import { StyleSheet } from "react-native";
import { radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/menu-bulk-upload.tsx. Cards are ui/Card, buttons ui/Button.
export const createBulkStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 14 },
    card: { gap: 12 },
    stepHead: { flexDirection: "row", alignItems: "center", gap: 10 },
    stepNumber: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: tokens.brandSkin,
      alignItems: "center",
      justifyContent: "center",
    },
    stepNumberText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: tokens.brand },
    stepTitle: { flex: 1, fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    body: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.sec },
    columns: {
      fontFamily: fontFamilies.body.medium,
      fontSize: typography.sizes.small,
      lineHeight: typography.lineHeights.small,
      color: tokens.text,
      backgroundColor: tokens.sunken,
      borderRadius: radius.sm,
      padding: 10,
    },
    fileName: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.small, color: tokens.text },
    error: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.error },
    summary: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    rows: { gap: 8 },
    row: { gap: 4, borderRadius: radius.md, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.surface, padding: 12 },
    rowInvalid: { borderColor: tokens.error, backgroundColor: tokens.errorSkin },
    rowHead: { flexDirection: "row", alignItems: "center", gap: 8 },
    rowNumber: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: tokens.muted },
    rowName: { flex: 1, fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    rowMeta: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.sec },
    more: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.muted, textAlign: "center" },
    fileHead: { flexDirection: "row", alignItems: "center", gap: 12 },
    fileIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.sm,
      backgroundColor: tokens.successSkin,
      alignItems: "center",
      justifyContent: "center",
    },
    fileTexts: { flex: 1, minWidth: 0, gap: 2 },
    sheetActions: { flexDirection: "row", gap: 10 },
    sheetAction: { flex: 1 },
    rowMetaLine: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
    editorScroll: { maxHeight: 460 },
    editorBody: { gap: 14, paddingTop: 12, paddingBottom: 8 },
    editorActions: { flexDirection: "row", gap: 10, marginTop: 12 },
    resultTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.large, color: tokens.text },
    actions: { gap: 10 },
    // The square-with-dot veg / non-veg label, as on the menu list.
    vegBox: { width: 14, height: 14, borderWidth: 1.5, borderRadius: 3, alignItems: "center", justifyContent: "center" },
    vegDot: { width: 6, height: 6, borderRadius: 3 },
  });

export type BulkStyles = ReturnType<typeof createBulkStyles>;
