import { StyleSheet } from "react-native";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Part of the ride-searching.styles stylesheet, kept under the 150-line file limit.
// Migrated from the legacy `Colors` palette + raw fontWeight to `designTokens`
// + named font families (BUG-098). Sizes/radii/spacing are unchanged.

export const createCancelSheetHandleStyles = (tokens: ThemeTokens, insets: any) =>
  StyleSheet.create({
    cancelSheetHandle: {
      width: 48,
      height: 4,
      borderRadius: 2,
      backgroundColor: tokens.border,
      alignSelf: "center",
      marginBottom: 22,
    },
    cancelReasonTitle: {
      fontFamily: fontFamilies.heading.semibold,
      fontSize: typography.sizes.large,
      lineHeight: typography.lineHeights.large,
      letterSpacing: -0.2,
      color: tokens.text,
      marginBottom: 6,
    },
    cancelReasonSubtitle: {
      fontFamily: fontFamilies.body.regular,
      fontSize: typography.sizes.medium,
      lineHeight: typography.lineHeights.medium,
      color: tokens.sec,
      marginBottom: 10,
    },
    cancelReasonDivider: {
      borderTopWidth: 1,
      borderStyle: "dashed",
      borderColor: tokens.border,
      marginBottom: 14,
    },
    cancelReasonRow: {
      height: 54,
      borderBottomWidth: 1,
      borderBottomColor: tokens.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 14,
    },
    cancelReasonText: {
      flex: 1,
      fontFamily: fontFamilies.body.semibold,
      fontSize: typography.sizes.medium,
      lineHeight: typography.lineHeights.medium,
      color: tokens.text,
      paddingRight: 10,
    },
    cancelConfirmClose: {
      position: "absolute",
      right: 16,
      // Inside cancelConfirmSheet now, sitting just above its own top edge —
      // follows the sheet (translated text, large fonts, a home-indicator
      // inset all change its real height) instead of a guessed screen offset.
      top: -56,
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: tokens.surface,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.18,
      shadowRadius: 7,
      elevation: 8,
      zIndex: 75,
    },
    cancelConfirmSheet: {
      backgroundColor: tokens.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: insets.bottom > 0 ? insets.bottom + 22 : 34,
      minHeight: 462,
    },
    cancelConfirmTitle: {
      fontFamily: fontFamilies.heading.semibold,
      fontSize: typography.sizes.large,
      lineHeight: typography.lineHeights.large,
      letterSpacing: -0.2,
      color: tokens.text,
      marginBottom: 12,
    },
    cancelConfirmCopy: {
      fontFamily: fontFamilies.body.regular,
      fontSize: typography.sizes.medium,
      lineHeight: typography.lineHeights.medium,
      color: tokens.sec,
      marginBottom: 18,
    },
    selectedReasonBox: {
      backgroundColor: tokens.sunken,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 9,
      marginBottom: 18,
    },
    selectedReasonLabel: {
      fontFamily: fontFamilies.body.medium,
      fontSize: typography.sizes.small,
      lineHeight: typography.lineHeights.small,
      color: tokens.sec,
      marginBottom: 2,
    },
    selectedReasonText: {
      fontFamily: fontFamilies.body.bold,
      fontSize: typography.sizes.medium,
      lineHeight: typography.lineHeights.medium,
      color: tokens.text,
    },
  });
