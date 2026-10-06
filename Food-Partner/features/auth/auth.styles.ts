import { StyleSheet } from "react-native";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for the sign-in, password-reset and launch screens.
export const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    content: { flexGrow: 1, paddingHorizontal: 20 },
    hero: { alignItems: "center", marginBottom: 28 },
    title: {
      fontFamily: fontFamilies.heading.bold,
      fontSize: typography.sizes.extraLarge,
      lineHeight: typography.lineHeights.extraLarge,
      letterSpacing: -0.4,
      color: tokens.text,
      textAlign: "center",
      marginTop: 18,
    },
    subtitle: {
      fontFamily: fontFamilies.body.regular,
      fontSize: typography.sizes.medium,
      lineHeight: typography.lineHeights.medium,
      color: tokens.sec,
      textAlign: "center",
      marginTop: 6,
      paddingHorizontal: 8,
    },
    form: { gap: 16 },
    forgotLink: { alignSelf: "flex-end", marginTop: -6 },
    footer: { alignItems: "center", gap: 2, marginTop: 24 },
    footerText: {
      fontFamily: fontFamilies.body.regular,
      fontSize: typography.sizes.medium,
      color: tokens.sec,
      textAlign: "center",
    },
    centerLink: { alignSelf: "center" },
    trust: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 28 },
    trustText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.muted },
    launch: { flex: 1, alignItems: "center", justifyContent: "center", gap: 36 },
  });

export type AuthStyles = ReturnType<typeof createStyles>;
