import { StyleSheet } from "react-native";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Part of the ride-searching.styles stylesheet, kept under the 150-line file limit.
// Migrated from the legacy `Colors` palette + raw fontWeight to `designTokens`
// + named font families (BUG-098). Sizes/radii/spacing are unchanged.

export const createTripButtonTextStyles = (tokens: ThemeTokens, insets: any) =>
  StyleSheet.create({
    tripButtonText: {
      fontFamily: fontFamilies.body.semibold,
      fontSize: typography.sizes.medium,
      color: tokens.text,
    },
    dashedLine: {
      borderTopWidth: 1,
      borderStyle: "dashed",
      borderColor: tokens.border,
      marginHorizontal: -16,
      marginBottom: 12,
    },
    suggestionCard: {
      borderWidth: 1,
      borderColor: tokens.border,
      backgroundColor: tokens.sunken,
      borderRadius: 14,
      paddingHorizontal: 18,
      paddingTop: 13,
      paddingBottom: 14,
    },
    suggestionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 13,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: tokens.surface,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      overflow: "hidden",
    },
    suggestionTitle: {
      flex: 1,
      fontFamily: fontFamilies.body.bold,
      fontSize: typography.sizes.medium,
      lineHeight: typography.lineHeights.medium,
      color: tokens.text,
    },
    addFareRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    addFarePill: {
      minWidth: 62,
      height: 30,
      borderRadius: 15,
      backgroundColor: tokens.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: tokens.border,
    },
    addFareText: {
      fontFamily: fontFamilies.body.semibold,
      fontSize: typography.sizes.medium,
      color: tokens.text,
    },
    bookAgainOverlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 45,
      justifyContent: "flex-end",
    },
    bookAgainBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: tokens.overlay,
    },
    bookAgainBackFloating: {
      position: "absolute",
      left: 18,
      // Inside bookAgainSheet now, sitting just above its own top edge —
      // follows the sheet instead of a guessed screen offset.
      top: -56,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: tokens.surface,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    bookAgainSheet: {
      backgroundColor: tokens.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 18,
      paddingTop: 32,
      paddingBottom: insets.bottom > 0 ? insets.bottom + 34 : 58,
    },
    bookAgainTitle: {
      fontFamily: fontFamilies.heading.bold,
      fontSize: typography.sizes.large,
      lineHeight: typography.lineHeights.large,
      letterSpacing: -0.3,
      color: tokens.text,
      marginBottom: 10,
    },
  });
