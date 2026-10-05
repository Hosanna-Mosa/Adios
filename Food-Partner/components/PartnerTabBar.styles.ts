import { Platform, StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { elevation, radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Same floating glass pill as the customer app's AppTabBar.styles.ts.

const SIDE_MARGIN = moderateScale(16);

export const TAB_PILL_HEIGHT = moderateScale(64);
export const BOTTOM_GAP = moderateScale(8);
export const TOP_CLEARANCE = moderateScale(16);

export const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    pill: {
      position: "absolute",
      left: SIDE_MARGIN,
      right: SIDE_MARGIN,
      height: TAB_PILL_HEIGHT,
      borderRadius: radius.pill,
      overflow: "hidden",
      backgroundColor: Platform.OS === "android" ? tokens.surface : `${tokens.surface}E6`,
      borderWidth: 1,
      borderColor: tokens.border,
      ...elevation.lg,
    },
    row: {
      flex: 1,
      flexDirection: "row",
      paddingHorizontal: 4,
    },
    indicator: {
      position: "absolute",
      top: moderateScale(7),
      bottom: moderateScale(7),
      left: 4,
      alignItems: "center",
      justifyContent: "center",
    },
    indicatorPill: {
      width: "86%",
      height: "100%",
      borderRadius: radius.pill,
      backgroundColor: tokens.brandSkin,
    },
    item: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
    },
    iconWrap: {
      position: "relative",
    },
    label: {
      fontFamily: fontFamilies.body.medium,
      fontSize: typography.sizes.small,
      color: tokens.muted,
    },
    labelActive: {
      fontFamily: fontFamilies.body.semibold,
      color: tokens.brand,
    },
    badge: {
      position: "absolute",
      top: -5,
      right: -10,
      minWidth: moderateScale(17),
      height: moderateScale(17),
      borderRadius: moderateScale(9),
      paddingHorizontal: 4,
      backgroundColor: tokens.error,
      borderWidth: 1.5,
      borderColor: tokens.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    badgeText: {
      fontFamily: fontFamilies.body.bold,
      fontSize: typography.sizes.small,
      color: "#FFFFFF",
    },
  });
