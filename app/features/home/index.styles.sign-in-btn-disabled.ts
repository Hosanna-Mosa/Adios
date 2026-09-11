import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
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
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: tokens.border,
  },
  dividerText: {
    fontFamily: fontFamilies.body.medium,
    fontSize: typography.sizes.small,
    color: tokens.muted,
  },
  otpBtn: {
    marginTop: 16,
    minHeight: moderateScale(52),
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: tokens.borderStrong,
    backgroundColor: tokens.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
  },
  otpBtnText: {
    fontFamily: fontFamilies.body.semibold,
    fontSize: typography.sizes.medium,
    color: tokens.text,
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
