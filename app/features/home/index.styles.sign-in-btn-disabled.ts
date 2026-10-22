import { StyleSheet } from "react-native";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Part of the index.styles stylesheet, kept under the 150-line file limit.
// Values are unchanged; index.styles.ts composes this back together.

export const createSignInBtnDisabledStyles = (tokens: ThemeTokens, accent: ServiceTokens) =>
  StyleSheet.create({
  signInBtnDisabled: {
    opacity: 0.5,
  },
  signInBtnText: {
    fontFamily: fontFamilies.body.bold,
    color: accent.on,
    fontSize: typography.sizes.medium,
  },
  signUpLinkRow: {
    marginTop: 20,
    alignItems: "center",
  },
  signUpLinkText: {
    fontFamily: fontFamilies.body.regular,
    fontSize: typography.sizes.medium,
    color: tokens.sec,
  },
  signUpLinkHighlight: {
    fontFamily: fontFamilies.body.semibold,
    color: accent.accent,
  },
  });
