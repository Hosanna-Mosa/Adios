import { StyleSheet } from "react-native";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Part of the ride-searching.styles stylesheet, kept under the 150-line file limit.
// Migrated from the legacy `Colors` palette + raw fontWeight to `designTokens`
// + named font families (BUG-098). Sizes/radii/spacing are unchanged.

export const createServiceSummaryCardStyles = (tokens: ThemeTokens, insets: any) =>
  StyleSheet.create({
    serviceSummaryCard: {
      height: 52,
      borderRadius: 10,
      backgroundColor: tokens.sunken,
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
      backgroundColor: tokens.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    serviceName: {
      fontFamily: fontFamilies.body.bold,
      fontSize: typography.sizes.medium,
      color: tokens.text,
    },
    serviceFare: {
      fontFamily: fontFamilies.body.bold,
      fontSize: typography.sizes.medium,
      color: tokens.text,
    },
    bookDashedLine: {
      borderTopWidth: 1,
      borderStyle: "dashed",
      borderColor: tokens.border,
      marginBottom: 10,
    },
    locationTitle: {
      fontFamily: fontFamilies.heading.semibold,
      fontSize: typography.sizes.large,
      lineHeight: typography.lineHeights.large,
      letterSpacing: -0.2,
      color: tokens.text,
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
      backgroundColor: tokens.success,
      borderWidth: 4,
      borderColor: tokens.surface,
    },
    locationDashes: {
      width: 1,
      height: 35,
      borderLeftWidth: 1,
      borderStyle: "dashed",
      borderColor: tokens.border,
      marginVertical: 2,
    },
    dropSmallDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: tokens.error,
      borderWidth: 4,
      borderColor: tokens.surface,
    },
    locationTextColumn: {
      flex: 1,
    },
    locationRow: {
      minHeight: 51,
    },
    locationName: {
      fontFamily: fontFamilies.body.bold,
      fontSize: typography.sizes.medium,
      color: tokens.text,
      marginBottom: 2,
    },
    locationAddress: {
      fontFamily: fontFamilies.body.regular,
      fontSize: typography.sizes.small,
      lineHeight: typography.lineHeights.small,
      color: tokens.sec,
    },
  });
