import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { radius, elevation, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for RestaurantListItem.tsx, moved out so the component file stays under 150 lines.
// Values are unchanged.

export const createStyles = (tokens: ThemeTokens, accentColor: string) => StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 16,
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderColor: tokens.border,
    borderRadius: radius.lg,
    padding: 16,
    minHeight: moderateScale(148),
    marginHorizontal: 16,
    marginBottom: 16,
    ...elevation.sm,
  },
  cardClosed: {
    opacity: 0.7,
  },
  thumb: {
    width: moderateScale(116),
    height: moderateScale(116),
    borderRadius: radius.md,
    backgroundColor: tokens.sunken,
    flexShrink: 0,
  },
  body: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  name: {
    flex: 1,
    fontFamily: fontFamilies.body.semibold,
    fontSize: typography.sizes.large,
    letterSpacing: -0.1,
    color: tokens.text,
  },
  vegRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 5,
  },
  vegIcon: {
    width: moderateScale(14),
    height: moderateScale(14),
    borderWidth: 1.5,
    borderColor: tokens.veg,
    borderRadius: moderateScale(3),
    alignItems: "center",
    justifyContent: "center",
  },
  vegDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: tokens.veg,
  },
  vegLabel: {
    fontFamily: fontFamilies.body.bold,
    fontSize: typography.sizes.small,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: tokens.veg,
  },
  metaLine: {
    fontFamily: fontFamilies.body.medium,
    fontSize: typography.sizes.medium,
    color: tokens.sec,
    marginTop: 6,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  offerBadge: {
    backgroundColor: `${accentColor}1A`,
    borderRadius: moderateScale(6),
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  offerText: {
    fontFamily: fontFamilies.body.bold,
    fontSize: typography.sizes.small,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: accentColor,
  },
  statusBadge: {
    borderRadius: moderateScale(6),
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadgeOpen: {
    backgroundColor: tokens.successSkin,
  },
  statusBadgeClosed: {
    backgroundColor: tokens.errorSkin,
  },
  statusText: {
    fontFamily: fontFamilies.body.bold,
    fontSize: typography.sizes.small,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  statusTextOpen: {
    color: tokens.success,
  },
  statusTextClosed: {
    color: tokens.error,
  },
});
