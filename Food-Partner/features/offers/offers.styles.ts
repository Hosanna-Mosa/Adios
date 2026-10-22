import { StyleSheet } from "react-native";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/offers.tsx and the new-offer sheet.
export const createOffersStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    card: { gap: 10 },
    top: { flexDirection: "row", alignItems: "center", gap: 12 },
    texts: { flex: 1, gap: 2 },
    code: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.large, letterSpacing: 1, color: tokens.text },
    title: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.brand },
    meta: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.sec },
    badges: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    sheetBody: { gap: 14, marginTop: 8 },
    choices: { flexDirection: "row", gap: 8 },
    hint: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.muted },
    prefix: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.muted },
    content: { paddingHorizontal: 16, paddingBottom: 24 },
  });

export type OffersStyles = ReturnType<typeof createOffersStyles>;
