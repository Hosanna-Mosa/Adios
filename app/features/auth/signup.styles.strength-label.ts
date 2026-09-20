import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Part of the signup.styles stylesheet, kept under the 150-line file limit.
// Values are unchanged; signup.styles.ts composes this back together.

export const createStrengthLabelStyles = (tokens: ThemeTokens, accent: ServiceTokens) =>
  StyleSheet.create({
  strengthLabel: {
    fontFamily: fontFamilies.body.semibold,
    fontSize: typography.sizes.small,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 24,
  },
  checkbox: {
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(6),
    borderWidth: 1.5,
    borderColor: tokens.borderStrong,
    backgroundColor: tokens.surface,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: accent.accent,
    borderColor: accent.accent,
  },
  termsText: {
    flex: 1,
    fontFamily: fontFamilies.body.regular,
    fontSize: typography.sizes.medium,
    lineHeight: typography.lineHeights.medium,
    color: tokens.sec,
  },
  legalHighlight: {
    fontFamily: fontFamilies.body.semibold,
    color: accent.accent,
  },
  signUpBtn: {
    marginTop: 14,
    height: moderateScale(52),
    borderRadius: moderateScale(14),
    backgroundColor: accent.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  signUpBtnDisabled: {
    opacity: 0.5,
  },
  signUpBtnText: {
    fontFamily: fontFamilies.body.bold,
    color: accent.on,
    fontSize: typography.sizes.medium,
  },
  loginLinkRow: {
    marginTop: 16,
    alignItems: "center",
  },
  loginLinkText: {
    fontFamily: fontFamilies.body.regular,
    fontSize: typography.sizes.medium,
    color: tokens.sec,
  },
  loginLinkHighlight: {
    fontFamily: fontFamilies.body.semibold,
    color: accent.accent,
  },
  });
