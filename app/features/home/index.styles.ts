import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";

// Styles for app/index.tsx. Moved out of the screen unchanged -- every value
// is exactly as it was, so nothing renders differently. Lives here rather
// than beside the screen because app/ is Expo Router's routing directory
// and a non-route file in there is treated as a route.

export const createStyles = (tokens: ThemeTokens, accent: ServiceTokens) => StyleSheet.create({
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
    fontSize: moderateScale(28),
    color: accent.on,
  },
  headline: {
    fontFamily: fontFamilies.heading.bold,
    fontSize: moderateScale(38),
    lineHeight: moderateScale(40),
    letterSpacing: -1.4,
    color: tokens.text,
    textAlign: "center",
  },
  subhead: {
    fontFamily: fontFamilies.body.regular,
    marginTop: 14,
    fontSize: moderateScale(16),
    lineHeight: moderateScale(22),
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
    fontSize: moderateScale(11),
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
    fontSize: moderateScale(15),
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
    fontSize: moderateScale(13),
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
  signInBtnDisabled: {
    opacity: 0.5,
  },
  signInBtnText: {
    fontFamily: fontFamilies.body.bold,
    color: accent.on,
    fontSize: moderateScale(15),
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
    fontSize: moderateScale(12),
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
    fontSize: moderateScale(15),
    color: tokens.text,
  },
  signUpLinkRow: {
    marginTop: 20,
    alignItems: "center",
  },
  signUpLinkText: {
    fontFamily: fontFamilies.body.regular,
    fontSize: moderateScale(14),
    color: tokens.sec,
  },
  signUpLinkHighlight: {
    fontFamily: fontFamilies.body.semibold,
    color: accent.accent,
  },
});
