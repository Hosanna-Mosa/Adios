import { StyleSheet } from "react-native";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/delete-account.tsx. Lives here rather than beside the screen
// because app/ is Expo Router's routing directory.
export const createDeleteAccountStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    body: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
    heading: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.large, color: tokens.text, marginBottom: 12 },
    pointRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
    bullet: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.error },
    pointText: { flex: 1, fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec },
    label: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginTop: 20, marginBottom: 6 },
    field: { borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 12, minHeight: 52, paddingHorizontal: 14, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text, backgroundColor: tokens.surface },
    footer: { paddingHorizontal: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: tokens.border, backgroundColor: tokens.surface },
  });

export type DeleteAccountStyles = ReturnType<typeof createDeleteAccountStyles>;
