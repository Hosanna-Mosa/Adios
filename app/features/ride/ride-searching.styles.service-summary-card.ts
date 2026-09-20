import { StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import { typography } from "@/constants/typography";

// Part of the ride-searching.styles stylesheet, kept under the 150-line file limit.
// Values are unchanged; ride-searching.styles.ts composes this back together.

export const createServiceSummaryCardStyles = (colors: typeof Colors.light, insets: any) =>
  StyleSheet.create({
    serviceSummaryCard: {
      height: 52,
      borderRadius: 10,
      backgroundColor: colors.surfaceSecondary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 14,
      marginBottom: 12,
    },
    serviceLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    serviceBikeBadge: {
      width: 42,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    serviceName: {
      fontSize: typography.sizes.medium,
      fontWeight: "900",
      color: colors.text,
    },
    serviceFare: {
      fontSize: typography.sizes.medium,
      fontWeight: "900",
      color: colors.text,
    },
    bookDashedLine: {
      borderTopWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.border,
      marginBottom: 10,
    },
    locationTitle: {
      fontSize: typography.sizes.large,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 9,
    },
    locationRows: {
      flexDirection: "row",
      paddingBottom: 10,
    },
    locationRail: {
      width: 24,
      alignItems: "center",
      paddingTop: 3,
      marginRight: 8,
    },
    pickupSmallDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: colors.success,
      borderWidth: 4,
      borderColor: colors.surface,
    },
    locationDashes: {
      width: 1,
      height: 35,
      borderLeftWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.border,
      marginVertical: 2,
    },
    dropSmallDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: colors.error,
      borderWidth: 4,
      borderColor: colors.surface,
    },
    locationTextColumn: {
      flex: 1,
    },
    locationRow: {
      minHeight: 51,
    },
    locationName: {
      fontSize: typography.sizes.medium,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 2,
    },
    locationAddress: {
      fontSize: typography.sizes.small,
      lineHeight: typography.lineHeights.small,
      color: colors.textSecondary,
    },
  });
