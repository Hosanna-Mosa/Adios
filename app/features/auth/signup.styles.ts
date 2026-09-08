import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";

// Styles for app/signup.tsx. Moved out of the screen unchanged -- every value
// is exactly as it was, so nothing renders differently. Lives here rather
// than beside the screen because app/ is Expo Router's routing directory
// and a non-route file in there is treated as a route.

export const createStyles = (tokens: ThemeTokens, accent: ServiceTokens) => StyleSheet.create({
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
    fontSize: moderateScale(38),
    lineHeight: moderateScale(40),
    letterSpacing: -1.4,
    color: tokens.text,
    textAlign: "center",
  },
  subhead: {
    fontFamily: fontFamilies.body.regular,
    marginTop: 12,
    fontSize: moderateScale(15),
    lineHeight: moderateScale(21),
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
    fontSize: moderateScale(11),
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
    fontSize: moderateScale(15),
    color: tokens.sec,
  },
  input: {
    flex: 1,
    fontFamily: fontFamilies.body.medium,
    fontSize: moderateScale(15),
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
  strengthLabel: {
    fontFamily: fontFamilies.body.semibold,
    fontSize: moderateScale(12),
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
    fontSize: moderateScale(13),
    lineHeight: moderateScale(19),
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
    fontSize: moderateScale(15),
  },
  loginLinkRow: {
    marginTop: 16,
    alignItems: "center",
  },
  loginLinkText: {
    fontFamily: fontFamilies.body.regular,
    fontSize: moderateScale(14),
    color: tokens.sec,
  },
  loginLinkHighlight: {
    fontFamily: fontFamilies.body.semibold,
    color: accent.accent,
  },
});
