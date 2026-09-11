import { StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import { typography } from "@/constants/typography";

// Part of the ride-searching.styles stylesheet, kept under the 150-line file limit.
// Values are unchanged; ride-searching.styles.ts composes this back together.

export const createCancelSheetHandleStyles = (colors: typeof Colors.light, insets: any) =>
  StyleSheet.create({
    cancelSheetHandle: {
      width: 48,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginBottom: 22,
    },
    cancelReasonTitle: {
      fontSize: typography.sizes.large,
      lineHeight: typography.lineHeights.large,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 6,
    },
    cancelReasonSubtitle: {
      fontSize: typography.sizes.medium,
      lineHeight: typography.lineHeights.medium,
      color: colors.textSecondary,
      marginBottom: 10,
    },
    cancelReasonDivider: {
      borderTopWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.border,
      marginBottom: 14,
    },
    cancelReasonRow: {
      height: 54,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 14,
    },
    cancelReasonText: {
      flex: 1,
      fontSize: typography.sizes.medium,
      lineHeight: typography.lineHeights.medium,
      fontWeight: "800",
      color: colors.text,
      paddingRight: 10,
    },
    cancelConfirmClose: {
      position: "absolute",
      right: 16,
      bottom: 476,
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.surface,
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
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: insets.bottom > 0 ? insets.bottom + 22 : 34,
      minHeight: 462,
    },
    cancelConfirmTitle: {
      fontSize: typography.sizes.large,
      lineHeight: typography.lineHeights.large,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 12,
    },
    cancelConfirmCopy: {
      fontSize: typography.sizes.medium,
      lineHeight: typography.lineHeights.medium,
      color: colors.textSecondary,
      marginBottom: 18,
    },
    selectedReasonBox: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 9,
      marginBottom: 18,
    },
    selectedReasonLabel: {
      fontSize: typography.sizes.small,
      lineHeight: typography.lineHeights.small,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    selectedReasonText: {
      fontSize: typography.sizes.medium,
      lineHeight: typography.lineHeights.medium,
      fontWeight: "800",
      color: colors.text,
    },
  });
