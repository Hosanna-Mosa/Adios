import { StyleSheet } from "react-native";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Part of the ride-searching.styles stylesheet, kept under the 150-line file limit.
// Migrated from the legacy `Colors` palette + raw fontWeight to `designTokens`
// + named font families (BUG-098). Sizes/radii/spacing are unchanged.

export const createCurrentAddressLabelStyles = (tokens: ThemeTokens, insets: any) =>
  StyleSheet.create({
    currentAddressLabel: {
      fontFamily: fontFamilies.body.regular,
      fontSize: typography.sizes.medium,
      lineHeight: typography.lineHeights.medium,
      color: tokens.text,
      marginBottom: 10,
    },
    cancelAddressRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },
    cancelAddressDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: tokens.success,
      borderWidth: 4,
      borderColor: tokens.surface,
      marginHorizontal: 6,
      marginRight: 18,
    },
    cancelAddressTextGroup: {
      flex: 1,
    },
    cancelAddressTitle: {
      fontFamily: fontFamilies.body.bold,
      fontSize: typography.sizes.medium,
      lineHeight: typography.lineHeights.medium,
      color: tokens.text,
      marginBottom: 1,
    },
    cancelAddressDetail: {
      fontFamily: fontFamilies.body.regular,
      fontSize: typography.sizes.small,
      lineHeight: typography.lineHeights.small,
      color: tokens.sec,
    },
    cancelMyRideButton: {
      height: 46,
      borderRadius: 23,
      backgroundColor: tokens.error,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    cancelMyRideText: {
      fontFamily: fontFamilies.body.semibold,
      fontSize: typography.sizes.medium,
      // No "on error" token exists yet — white is the same deliberate choice
      // other error-colored surfaces in the app make (e.g. DishDetailSheet's
      // close icon on its overlay).
      color: "#FFFFFF",
    },
    keepSearchingButton: {
      height: 46,
      borderRadius: 23,
      borderWidth: 1,
      borderColor: tokens.brand,
      alignItems: "center",
      justifyContent: "center",
    },
    keepSearchingText: {
      fontFamily: fontFamilies.body.semibold,
      fontSize: typography.sizes.medium,
      color: tokens.brand,
    },
  });
