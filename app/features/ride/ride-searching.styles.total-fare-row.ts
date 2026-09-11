import { StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import { typography } from "@/constants/typography";

// Part of the ride-searching.styles stylesheet, kept under the 150-line file limit.
// Values are unchanged; ride-searching.styles.ts composes this back together.

export const createTotalFareRowStyles = (colors: typeof Colors.light, insets: any) =>
  StyleSheet.create({
    totalFareRow: {
      height: 44,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginHorizontal: -18,
      paddingHorizontal: 18,
      marginBottom: 0,
    },
    totalFareLabel: {
      fontSize: typography.sizes.large,
      fontWeight: "900",
      color: colors.text,
    },
    totalFareValue: {
      fontSize: typography.sizes.large,
      fontWeight: "900",
      color: colors.text,
    },
    paymentRow: {
      height: 46,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginHorizontal: -18,
      paddingHorizontal: 18,
      borderBottomWidth: 1,
      borderColor: colors.border,
      marginBottom: 22,
    },
    paymentText: {
      fontSize: typography.sizes.medium,
      color: colors.textSecondary,
    },
    backYellowButton: {
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    backYellowText: {
      fontSize: typography.sizes.medium,
      fontWeight: "800",
      color: colors.surface,
    },
    cancelRideButton: {
      height: 46,
      borderRadius: 23,
      borderWidth: 1,
      borderColor: colors.error,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    cancelRideText: {
      fontSize: typography.sizes.medium,
      fontWeight: "700",
      color: colors.error,
    },
    cancelFlowOverlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 70,
      justifyContent: "flex-end",
    },
    cancelFlowBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlay,
    },
    cancelFlowBackButton: {
      position: "absolute",
      left: 14,
      bottom: 562,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.18,
      shadowRadius: 7,
      elevation: 8,
    },
    cancelReasonSheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: insets.bottom > 0 ? insets.bottom + 22 : 28,
      minHeight: 520,
    },
  });
