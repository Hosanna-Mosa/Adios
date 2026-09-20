import { StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import { typography } from "@/constants/typography";

// Part of the ride-searching.styles stylesheet, kept under the 150-line file limit.
// Values are unchanged; ride-searching.styles.ts composes this back together.

export const createFloatingCardStyles = (colors: typeof Colors.light, insets: any) =>
  StyleSheet.create({
    floatingCard: {
      borderRadius: 24,
      borderWidth: 1,
      padding: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
      gap: 16,
    },
    handle: {
      width: 42,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginBottom: 11,
    },
    headerInfo: {
      marginBottom: 16,
    },
    statusDotRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    pulseDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8,
    },
    title: {
      fontSize: typography.sizes.large,
      fontWeight: "800",
      color: colors.text,
    },
    subtitle: {
      fontSize: typography.sizes.medium,
      color: colors.textSecondary,
      marginLeft: 16, // aligns with title text indent
    },
    progressTrack: {
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.borderLight,
      overflow: "hidden",
      position: "relative",
      marginBottom: 20,
    },
    progressBarActive: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 120,
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
    fareCard: {
      height: 64,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      marginBottom: 12,
    },
    bikeBadge: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    fareTextGroup: {
      flex: 1,
    },
    fareLabel: {
      fontSize: typography.sizes.medium,
      color: colors.text,
      marginBottom: 3,
    },
    fareValue: {
      fontSize: typography.sizes.medium,
      color: colors.text,
      fontWeight: "800",
    },
    tripButton: {
      height: 34,
      paddingHorizontal: 18,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
  });
