import { StyleSheet } from "react-native";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

export const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    content: { paddingHorizontal: 20, paddingBottom: 24 },
    settingsContent: { paddingHorizontal: 16, paddingTop: 8 },
    list: { gap: 12 },
    hero: { alignItems: "center", marginBottom: 28 },
    title: {
      fontFamily: fontFamilies.heading.bold,
      fontSize: typography.sizes.extraLarge,
      lineHeight: typography.lineHeights.extraLarge,
      color: tokens.text,
      marginTop: 20,
      textAlign: "center",
    },
    subtitle: {
      fontFamily: fontFamilies.body.regular,
      fontSize: typography.sizes.medium,
      lineHeight: typography.lineHeights.medium,
      color: tokens.sec,
      marginTop: 6,
      textAlign: "center",
    },
  });

export type LanguageStyles = ReturnType<typeof createStyles>;
