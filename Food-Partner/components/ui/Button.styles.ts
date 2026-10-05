import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for Button.tsx — the customer app's Button.styles.ts, plus the
// "link" variant (brand-coloured text with no pill around it).

export type Size = "md" | "sm";

export const createStyles = (tokens: ThemeTokens, size: Size) => {
  const height = size === "sm" ? moderateScale(40) : moderateScale(52);
  return StyleSheet.create({
    base: {
      height,
      borderRadius: radius.pill,
      backgroundColor: tokens.brand,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      paddingHorizontal: moderateScale(20),
    },
    secondary: {
      backgroundColor: tokens.surface,
      borderWidth: 1.5,
      borderColor: tokens.border,
    },
    ghost: {
      backgroundColor: "transparent",
    },
    danger: {
      backgroundColor: tokens.error,
    },
    link: {
      backgroundColor: "transparent",
      height: undefined,
      paddingHorizontal: 0,
      paddingVertical: 4,
      alignSelf: "flex-start",
    },
    fullWidth: {
      width: "100%",
    },
    disabled: {
      opacity: 0.5,
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    label: {
      fontFamily: fontFamilies.body.bold,
      fontSize: size === "sm" ? typography.sizes.medium : typography.sizes.large,
    },
    labelOnBrand: {
      color: tokens.onBrand,
    },
    labelOnSurface: {
      color: tokens.text,
    },
    labelLink: {
      fontFamily: fontFamilies.body.semibold,
      fontSize: typography.sizes.medium,
      color: tokens.brand,
    },
  });
};
