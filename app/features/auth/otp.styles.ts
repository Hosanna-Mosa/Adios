import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/otp.tsx. Moved out of the screen unchanged -- every value
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
    // Same cap as screens 1 & 2's hero blocks.
    maxHeight: moderateScale(200),
    minHeight: moderateScale(120),
  },
  headline: {
    // Same size as screens 1 & 2's headlines — kept identical on purpose.
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
  subheadStrong: {
    fontFamily: fontFamilies.body.semibold,
    color: tokens.text,
  },
  subheadLink: {
    fontFamily: fontFamilies.body.semibold,
    color: accent.accent,
  },
  otpRow: {
    flexDirection: "row",
    gap: 8,
  },
  otpCell: {
    flex: 1,
    height: moderateScale(58),
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: tokens.borderStrong,
    backgroundColor: tokens.surface,
    fontFamily: fontFamilies.heading.bold,
    fontSize: typography.sizes.extraLarge,
    color: tokens.text,
  },
  otpCellActive: {
    borderWidth: 2,
    borderColor: accent.accent,
  },
  resendRow: {
    marginTop: 18,
    alignItems: "center",
  },
  resendMuted: {
    fontFamily: fontFamilies.body.medium,
    fontSize: typography.sizes.medium,
    color: tokens.sec,
  },
  resendActive: {
    fontFamily: fontFamilies.body.semibold,
    fontSize: typography.sizes.medium,
    color: accent.accent,
  },
  verifyBtn: {
    marginTop: 24,
    height: moderateScale(52),
    borderRadius: moderateScale(14),
    backgroundColor: accent.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  verifyBtnDisabled: {
    opacity: 0.5,
  },
  verifyBtnText: {
    fontFamily: fontFamilies.body.bold,
    color: accent.on,
    fontSize: typography.sizes.medium,
  },
  callRow: {
    marginTop: 16,
    alignItems: "center",
  },
  callText: {
    fontFamily: fontFamilies.body.regular,
    fontSize: typography.sizes.medium,
    color: tokens.sec,
  },
  callHighlight: {
    fontFamily: fontFamilies.body.semibold,
    color: accent.accent,
  },
});
