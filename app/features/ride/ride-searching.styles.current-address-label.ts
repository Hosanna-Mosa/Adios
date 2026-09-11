import { StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import { typography } from "@/constants/typography";

// Part of the ride-searching.styles stylesheet, kept under the 150-line file limit.
// Values are unchanged; ride-searching.styles.ts composes this back together.

export const createCurrentAddressLabelStyles = (colors: typeof Colors.light, insets: any) =>
  StyleSheet.create({
    currentAddressLabel: {
      fontSize: typography.sizes.medium,
      lineHeight: typography.lineHeights.medium,
      color: colors.text,
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
      backgroundColor: colors.success,
      borderWidth: 4,
      borderColor: colors.surface,
      marginHorizontal: 6,
      marginRight: 18,
    },
    cancelAddressTextGroup: {
      flex: 1,
    },
    cancelAddressTitle: {
      fontSize: typography.sizes.medium,
      lineHeight: typography.lineHeights.medium,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 1,
    },
    cancelAddressDetail: {
      fontSize: typography.sizes.small,
      lineHeight: typography.lineHeights.small,
      color: colors.textSecondary,
    },
    cancelMyRideButton: {
      height: 46,
      borderRadius: 23,
      backgroundColor: colors.error,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    cancelMyRideText: {
      fontSize: typography.sizes.medium,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    keepSearchingButton: {
      height: 46,
      borderRadius: 23,
      borderWidth: 1,
      borderColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    keepSearchingText: {
      fontSize: typography.sizes.medium,
      fontWeight: "700",
      color: colors.primary,
    },
  });
