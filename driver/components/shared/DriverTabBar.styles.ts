import { Platform, StyleSheet } from "react-native";
import { SIDE_MARGIN, TAB_PILL_HEIGHT } from "./DriverTabBar.constants";
import { Colors, elevation, radius } from "@/constants/colors";
import { moderateScale } from "react-native-size-matters";
import { fontFamilies, typography } from "@/constants/typography";

export const styles = StyleSheet.create({
  tabPill: {
    position: "absolute",
    left: SIDE_MARGIN,
    right: SIDE_MARGIN,
    height: TAB_PILL_HEIGHT,
    borderRadius: radius.pill,
    overflow: "hidden",
    backgroundColor: Platform.OS === "android" ? Colors.surface : `${Colors.surface}E6`,
    borderWidth: 1,
    borderColor: Colors.border,
    ...elevation.lg,
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
    backgroundColor: Colors.brandSkin,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  tabLabel: {
    fontFamily: fontFamilies.body.medium,
    fontSize: typography.sizes.small,
    color: Colors.tabInactive,
  },
});
