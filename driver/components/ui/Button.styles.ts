import { StyleSheet } from "react-native";
import { Colors, radius } from "@/constants/colors";
import { moderateScale } from "react-native-size-matters";
import { fontFamilies, typography } from "@/constants/typography";

export const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    backgroundColor: Colors.brand,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: moderateScale(20),
  },
  baseMd: {
    height: moderateScale(52),
  },
  baseSm: {
    height: moderateScale(40),
  },
  secondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  danger: {
    backgroundColor: Colors.error,
  },
  fullWidth: {
    width: "100%",
  },
  iconOnlyMd: {
    width: moderateScale(52),
    paddingHorizontal: 0,
  },
  iconOnlySm: {
    width: moderateScale(40),
    paddingHorizontal: 0,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: {
    fontFamily: fontFamilies.body.bold,
    fontSize: typography.sizes.large,
  },
  labelSm: {
    fontFamily: fontFamilies.body.bold,
    fontSize: typography.sizes.medium,
  },
  labelOnBrand: {
    color: Colors.onBrand,
  },
  labelOnSurface: {
    color: Colors.text,
  },
});
