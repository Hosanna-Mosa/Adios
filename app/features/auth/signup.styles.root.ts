import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Part of the signup.styles stylesheet, kept under the 150-line file limit.
// Values are unchanged; signup.styles.ts composes this back together.

export const createRootStyles = (tokens: ThemeTokens, accent: ServiceTokens) =>
  StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.bg,
  },
  headerRow: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  backBtn: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderColor: tokens.border,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  heroBlock: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // Same cap as the sign-in screen's hero block — centered, not a huge gap.
    maxHeight: moderateScale(200),
    minHeight: moderateScale(120),
  },
  headline: {
    // Same size as the sign-in screen's headline — kept identical on purpose.
    fontFamily: fontFamilies.heading.bold,
    fontSize: typography.sizes.extraLarge,
    lineHeight: typography.lineHeights.extraLarge,
    letterSpacing: -1.4,
    color: tokens.text,
    textAlign: "center",
  },
  subhead: {
    fontFamily: fontFamilies.body.regular,
    marginTop: 12,
    fontSize: typography.sizes.medium,
    lineHeight: typography.lineHeights.medium,
    color: tokens.sec,
    textAlign: "center",
  },
  form: {
    gap: 12,
  },
  fieldWrapper: {
    gap: 7,
  },
  fieldLabel: {
    fontFamily: fontFamilies.body.bold,
    fontSize: typography.sizes.small,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: tokens.muted,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: tokens.surface,
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: tokens.borderStrong,
    minHeight: moderateScale(52),
    paddingHorizontal: 14,
  },
  inputContainerAccent: {
    borderWidth: 2,
    borderColor: accent.accent,
  },
  inputContainerDisabled: {
    opacity: 0.6,
  },
  inputPrefix: {
    fontFamily: fontFamilies.body.medium,
    fontSize: typography.sizes.medium,
    color: tokens.sec,
  },
  input: {
    flex: 1,
    fontFamily: fontFamilies.body.medium,
    fontSize: typography.sizes.medium,
    color: tokens.text,
    height: "100%",
  },
  eyeBtn: {
    padding: 4,
  },
  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 999,
  },
  });
