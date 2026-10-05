import { StyleSheet } from "react-native";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

export const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    content: { paddingHorizontal: 16 },
    // The scroll content is already padded; the title must not add its own.
    title: { paddingHorizontal: 0 },
    version: {
      fontFamily: fontFamilies.body.medium,
      fontSize: typography.sizes.small,
      color: tokens.muted,
      textAlign: "center",
      marginTop: 20,
    },
    formContent: { paddingHorizontal: 16, paddingTop: 4, gap: 14 },
    form: { gap: 16 },
    rule: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.muted, marginTop: -6 },
  });

export type AccountStyles = ReturnType<typeof createStyles>;
