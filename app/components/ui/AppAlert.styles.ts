import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { elevation, radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for AppAlert.tsx, kept in a sibling file the way Button does it.

export const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: tokens.overlay,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    card: {
      width: "100%",
      maxWidth: 340,
      backgroundColor: tokens.surface,
      borderRadius: radius.lg,
      padding: 22,
      alignItems: "center",
      ...elevation.lg,
    },
    iconCircle: {
      width: moderateScale(44),
      height: moderateScale(44),
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    title: {
      fontFamily: fontFamilies.body.semibold,
      fontSize: typography.sizes.large,
      lineHeight: typography.lineHeights.large,
      color: tokens.text,
      textAlign: "center",
    },
    message: {
      fontFamily: fontFamilies.body.regular,
      fontSize: typography.sizes.medium,
      lineHeight: typography.lineHeights.medium,
      color: tokens.sec,
      textAlign: "center",
      marginTop: 8,
    },
    buttons: {
      width: "100%",
      marginTop: 18,
      gap: 8,
    },
    button: {
      width: "100%",
      minHeight: moderateScale(48),
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: tokens.brand,
    },
    buttonCancel: {
      backgroundColor: "transparent",
      minHeight: moderateScale(44),
    },
    buttonDestructive: {
      backgroundColor: tokens.error,
    },
    buttonText: {
      fontFamily: fontFamilies.body.bold,
      fontSize: typography.sizes.medium,
      color: tokens.onBrand,
    },
    buttonTextCancel: {
      fontFamily: fontFamilies.body.semibold,
      color: tokens.sec,
    },
  });

export const iconFor = (tokens: ThemeTokens) => ({
  info: { name: "information-circle" as const, color: tokens.brand, skin: tokens.brandSkin },
  success: { name: "checkmark-circle" as const, color: tokens.success, skin: tokens.successSkin },
  error: { name: "alert-circle" as const, color: tokens.error, skin: tokens.errorSkin },
  warning: { name: "warning" as const, color: tokens.warning, skin: tokens.warningSkin },
});
