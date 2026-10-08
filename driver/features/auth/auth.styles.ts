import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

/** Merged from the part files that used to sit beside this one: they were
 *  split only to satisfy a 150-line cap, and re-spread here at runtime. */
export const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    gap: 24,
  },
  logoSection: {
    alignItems: "center",
    gap: 6,
  },
  logoContainer: {
    width: moderateScale(72),
    height: moderateScale(72),
    borderRadius: moderateScale(22),
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  appName: {
    fontSize: typography.sizes.extraLarge,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: typography.sizes.medium,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  formSection: {
    gap: 14,
  },
  countryCodeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  formTitle: {
    fontSize: typography.sizes.extraLarge,
    fontWeight: "700",
    color: Colors.text,
  },
  formSubtitle: {
    fontSize: typography.sizes.medium,
    color: Colors.textSecondary,
    lineHeight: typography.lineHeights.medium,
    marginTop: -6,
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceAlt,
    borderRadius: moderateScale(10),
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: moderateScale(8),
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: typography.sizes.medium,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  countryCode: {
    fontSize: typography.sizes.large,
    fontWeight: "600",
    color: Colors.text,
  },
  phoneDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },

  otpContainer: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginVertical: 4,
  },
  otpBox: {
    width: moderateScale(44),
    height: moderateScale(50),
    borderRadius: moderateScale(10),
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    textAlign: "center",
    fontSize: typography.sizes.large,
    fontWeight: "700",
    color: Colors.text,
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: Colors.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  resendButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  resendText: {
    fontSize: typography.sizes.medium,
    color: Colors.primary,
    fontWeight: "600",
  },
  switchButton: {
    alignItems: "center",
    paddingVertical: 2,
  },
  switchText: {
    fontSize: typography.sizes.medium,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
});
