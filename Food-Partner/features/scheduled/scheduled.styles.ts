import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

export const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    segments: { marginHorizontal: 16, marginBottom: 14, marginTop: 4 },
    card: { gap: 12 },
    top: { flexDirection: "row", alignItems: "center", gap: 12 },
    dateTile: {
      width: moderateScale(52),
      height: moderateScale(56),
      borderRadius: radius.md,
      backgroundColor: tokens.infoSkin,
      alignItems: "center",
      justifyContent: "center",
    },
    month: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: tokens.info, textTransform: "uppercase" },
    day: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.extraLarge, lineHeight: typography.lineHeights.extraLarge, color: tokens.info },
    headTexts: { flex: 1 },
    time: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.large, color: tokens.text },
    weekday: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec, marginTop: 2 },
    details: { backgroundColor: tokens.sunken, borderRadius: radius.md, padding: 12, gap: 8 },
    meta: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.muted },
    reference: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.small, color: tokens.muted, letterSpacing: 0.6, marginTop: -8 },
    actions: { flexDirection: "row", gap: 10 },
    flex: { flex: 1 },
  });

export type ScheduledStyles = ReturnType<typeof createStyles>;
