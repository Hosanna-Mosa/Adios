import { StyleSheet } from "react-native";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Part of the ride-searching.styles stylesheet, kept under the 150-line file limit.
// Migrated from the legacy `Colors` palette + raw fontWeight to `designTokens`
// + named font families (BUG-098). Sizes/radii/spacing are unchanged.

export const createTotalFareRowStyles = (tokens: ThemeTokens, insets: any) =>
  StyleSheet.create({
    totalFareRow: {
      height: 44,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: tokens.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginHorizontal: -18,
      paddingHorizontal: 18,
      marginBottom: 0,
    },
    totalFareLabel: {
      fontFamily: fontFamilies.body.semibold,
      fontSize: typography.sizes.large,
      color: tokens.text,
    },
    totalFareValue: {
      fontFamily: fontFamilies.heading.semibold,
      fontSize: typography.sizes.large,
      letterSpacing: -0.2,
      color: tokens.text,
    },
    paymentRow: {
      height: 46,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginHorizontal: -18,
      paddingHorizontal: 18,
      borderBottomWidth: 1,
      borderColor: tokens.border,
      marginBottom: 22,
    },
    paymentText: {
      fontFamily: fontFamilies.body.medium,
      fontSize: typography.sizes.medium,
      color: tokens.sec,
    },
    backYellowButton: {
      height: 48,
      borderRadius: 24,
      backgroundColor: tokens.brand,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    backYellowText: {
      fontFamily: fontFamilies.body.bold,
      fontSize: typography.sizes.medium,
      color: tokens.onBrand,
    },
    cancelRideButton: {
      height: 46,
      borderRadius: 23,
      borderWidth: 1,
      borderColor: tokens.error,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    cancelRideText: {
      fontFamily: fontFamilies.body.semibold,
      fontSize: typography.sizes.medium,
      color: tokens.error,
    },
    cancelFlowOverlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 70,
      justifyContent: "flex-end",
    },
    cancelFlowBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: tokens.overlay,
    },
    cancelFlowBackButton: {
      position: "absolute",
      left: 14,
      // Inside cancelReasonSheet now, sitting just above its own top edge —
      // follows the sheet instead of a guessed screen offset.
      top: -56,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: tokens.surface,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.18,
      shadowRadius: 7,
      elevation: 8,
    },
    cancelReasonSheet: {
      backgroundColor: tokens.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: insets.bottom > 0 ? insets.bottom + 22 : 28,
      minHeight: 520,
    },
  });
