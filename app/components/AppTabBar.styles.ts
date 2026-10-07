import { StyleSheet, Platform } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { radius, elevation, type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for AppTabBar.tsx, moved out so the component file stays under 150 lines.
// Values are unchanged.

const SIDE_MARGIN = moderateScale(16);

export const CART_CARD_HEIGHT = moderateScale(68);

export const TAB_PILL_HEIGHT = moderateScale(62);

export const createStyles = (tokens: ThemeTokens, accent: ServiceTokens, cart: ServiceTokens = accent) => StyleSheet.create({
  tabPill: {
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
  cartCard: {
    position: "absolute",
    left: SIDE_MARGIN,
    right: SIDE_MARGIN,
    height: CART_CARD_HEIGHT,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: Platform.OS === "android" ? tokens.surface : `${tokens.surface}E6`,
    borderWidth: 1,
    borderColor: tokens.border,
    ...elevation.md,
  },
  cartRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
  },
  // The outlet's photo on the cart stripe (components/CartStripe.tsx).
  cartThumb: {
    width: moderateScale(46),
    height: moderateScale(46),
    borderRadius: moderateScale(12),
    backgroundColor: cart.skin,
  },
  cartThumbFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  cartInfo: {
    flex: 1,
    minWidth: 0,
  },
  cartVendor: {
    fontFamily: fontFamilies.body.semibold,
    fontSize: typography.sizes.medium,
    color: tokens.text,
  },
  cartPrice: {
    fontFamily: fontFamilies.body.bold,
    color: tokens.text,
  },
  cartMeta: {
    fontFamily: fontFamilies.body.medium,
    fontSize: typography.sizes.small,
    color: tokens.sec,
    marginTop: 2,
  },
  cartCta: {
    fontFamily: fontFamilies.body.bold,
    fontSize: typography.sizes.small,
    color: cart.on,
    backgroundColor: cart.accent,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  tabRow: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 4,
  },
  indicator: {
    position: "absolute",
    top: moderateScale(7),
    bottom: moderateScale(7),
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  indicatorPill: {
    width: "82%",
    height: "100%",
    borderRadius: radius.pill,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    position: "relative",
  },
  tabLabel: {
    fontFamily: fontFamilies.body.medium,
    fontSize: typography.sizes.small,
    color: tokens.muted,
  },
  cartIconWrap: {
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -8,
    minWidth: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
    backgroundColor: accent.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    fontFamily: fontFamilies.body.bold,
    fontSize: typography.sizes.small,
    color: accent.on,
  },
});

export type AppTabBarStyles = ReturnType<typeof createStyles>;
