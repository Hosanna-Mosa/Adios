import { StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import { typography } from "@/constants/typography";

// Part of the ride-searching.styles stylesheet, kept under the 150-line file limit.
// Values are unchanged; ride-searching.styles.ts composes this back together.

export const createTripButtonTextStyles = (colors: typeof Colors.light, insets: any) =>
  StyleSheet.create({
    tripButtonText: {
      fontSize: typography.sizes.medium,
      fontWeight: "700",
      color: colors.text,
    },
    dashedLine: {
      borderTopWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.border,
      marginHorizontal: -16,
      marginBottom: 12,
    },
    suggestionCard: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
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
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      overflow: "hidden",
    },
    suggestionTitle: {
      flex: 1,
      fontSize: typography.sizes.medium,
      lineHeight: typography.lineHeights.medium,
      fontWeight: "800",
      color: colors.text,
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
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    addFareText: {
      fontSize: typography.sizes.medium,
      fontWeight: "700",
      color: colors.text,
    },
    bookAgainOverlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 45,
      justifyContent: "flex-end",
    },
    bookAgainBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlay,
    },
    bookAgainBackFloating: {
      position: "absolute",
      left: 18,
      bottom: 600,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    bookAgainSheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 18,
      paddingTop: 32,
      paddingBottom: insets.bottom > 0 ? insets.bottom + 34 : 58,
    },
    bookAgainTitle: {
      fontSize: typography.sizes.large,
      lineHeight: typography.lineHeights.large,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 10,
    },
  });
