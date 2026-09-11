import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Part of the index.styles stylesheet, kept under the 150-line file limit.
// Values are unchanged; index.styles.ts composes this back together.

export const createRootStyles = (tokens: ThemeTokens, accent: ServiceTokens) =>
  StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.bg,
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
    // Capped close to the block's actual content height so "centered" doesn't
    // read as a big empty gap before the form — just gentle breathing room.
    maxHeight: moderateScale(200),
    minHeight: moderateScale(140),
  },
  logoMark: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(18),
    backgroundColor: accent.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  logoMarkText: {
    fontFamily: fontFamilies.heading.bold,
    fontSize: typography.sizes.extraLarge,
    color: accent.on,
  },
  headline: {
    fontFamily: fontFamilies.heading.bold,
    fontSize: typography.sizes.extraLarge,
    lineHeight: typography.lineHeights.extraLarge,
    letterSpacing: -1.4,
    color: tokens.text,
    textAlign: "center",
  },
  subhead: {
    fontFamily: fontFamilies.body.regular,
    marginTop: 14,
    fontSize: typography.sizes.large,
    lineHeight: typography.lineHeights.large,
    color: tokens.sec,
    textAlign: "center",
  },
  form: {
    marginTop: 36,
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
  input: {
    flex: 1,
    fontFamily: fontFamilies.body.medium,
    fontSize: typography.sizes.medium,
    color: tokens.text,
    height: "100%",
  },
  eyeBtn: {
    padding: 6,
  },
  forgotRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  forgotText: {
    fontFamily: fontFamilies.body.semibold,
    fontSize: typography.sizes.medium,
    color: accent.accent,
    paddingVertical: 4,
  },
  signInBtn: {
    height: moderateScale(52),
    borderRadius: moderateScale(14),
    backgroundColor: accent.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  });
