import { StyleSheet, Dimensions } from "react-native";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { typography } from "@/constants/typography";
const { height } = Dimensions.get("window");

// Part of the pickup-confirmation.styles stylesheet, kept under the 150-line file limit.
// Values are unchanged; pickup-confirmation.styles.ts composes this back together.

export const createTitleStyles = (tokens: ThemeTokens, accent: ServiceTokens, insets: any) =>
  StyleSheet.create({
    title: {
      fontSize: typography.sizes.large,
      fontWeight: "800",
      color: tokens.text,
      marginBottom: 18,
    },
    addressCard: {
      borderWidth: 2,
      borderColor: accent.accent,
      borderRadius: 10,
      backgroundColor: tokens.sunken,
      paddingHorizontal: 10,
      paddingVertical: 8,
      marginBottom: 12,
    },
    addressTitle: {
      fontSize: typography.sizes.large,
      fontWeight: "800",
      color: tokens.text,
      marginBottom: 1,
    },
    addressSubtitle: {
      fontSize: typography.sizes.medium,
      color: tokens.sec,
    },
    metaRow: {
      minHeight: 28,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 26,
    },
    metaText: {
      fontSize: typography.sizes.medium,
      fontWeight: "700",
      color: tokens.sec,
    },
    metaValue: {
      minWidth: 62,
      alignItems: "flex-end",
    },
    updateButton: {
      height: 46,
      borderRadius: 23,
      backgroundColor: accent.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    updateButtonText: {
      color: accent.on,
      fontSize: typography.sizes.medium,
      fontWeight: "800",
    },
  });
