import { StyleSheet } from "react-native";
import { type ThemeTokens } from "@/constants/colors";
import { elevation } from "@/constants/scales";
import { fontFamilies, typography } from "@/constants/typography";

// Part of the ride-searching.styles stylesheet, kept under the 150-line file limit.
// Migrated from the legacy `Colors` palette + raw fontWeight to `designTokens`
// + named font families (BUG-098). Sizes/radii/spacing are unchanged.

export const createFloatingCardStyles = (tokens: ThemeTokens, insets: any) =>
  StyleSheet.create({
    floatingCard: {
      borderRadius: 24,
      borderWidth: 1,
      borderColor: tokens.border,
      backgroundColor: tokens.surface,
      padding: 24,
      // This card floats directly over the map rather than sitting inside an
      // already-opaque sheet (the pattern finding-driver/ride-confirmation's
      // cards use), so — like the tab bar's floating pill — it keeps a real
      // shadow for depth, now from the shared token instead of hand-picked
      // numbers.
      ...elevation.lg,
      gap: 16,
    },
    handle: {
      width: 42,
      height: 4,
      borderRadius: 2,
      backgroundColor: tokens.border,
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
      fontFamily: fontFamilies.heading.semibold,
      fontSize: typography.sizes.large,
      lineHeight: typography.lineHeights.large,
      letterSpacing: -0.2,
      color: tokens.text,
    },
    subtitle: {
      fontFamily: fontFamilies.body.regular,
      fontSize: typography.sizes.medium,
      lineHeight: typography.lineHeights.medium,
      color: tokens.sec,
      marginLeft: 16, // aligns with title text indent
    },
    progressTrack: {
      height: 4,
      borderRadius: 2,
      backgroundColor: tokens.sunken,
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
      backgroundColor: tokens.brand,
      borderRadius: 2,
    },
    fareCard: {
      height: 64,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: tokens.border,
      backgroundColor: tokens.surface,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      marginBottom: 12,
    },
    bikeBadge: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: tokens.sunken,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
      borderWidth: 1,
      borderColor: tokens.border,
    },
    fareTextGroup: {
      flex: 1,
    },
    fareLabel: {
      fontFamily: fontFamilies.body.medium,
      fontSize: typography.sizes.medium,
      color: tokens.sec,
      marginBottom: 3,
    },
    fareValue: {
      fontFamily: fontFamilies.body.bold,
      fontSize: typography.sizes.medium,
      color: tokens.text,
    },
    tripButton: {
      height: 34,
      paddingHorizontal: 18,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: tokens.border,
      alignItems: "center",
      justifyContent: "center",
    },
  });
