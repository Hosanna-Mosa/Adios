import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/order/[id].tsx. Containers are ui/Card, card titles are
// ui/SectionHeader and the bottom bar is ScreenShell's footer, so only the
// order-specific content is styled here.
export const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    content: { paddingHorizontal: 16, paddingTop: 8, gap: 14 },
    summaryTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
    orderId: {
      fontFamily: fontFamilies.heading.bold,
      fontSize: typography.sizes.extraLarge,
      lineHeight: typography.lineHeights.extraLarge,
      color: tokens.text,
    },
    placedAt: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec, marginTop: 4 },
    codeBox: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      backgroundColor: tokens.brandSkin,
      borderRadius: radius.md,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginTop: 16,
    },
    codeTexts: { flex: 1 },
    codeLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.text },
    codeHint: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.sec, marginTop: 2 },
    code: {
      fontFamily: fontFamilies.heading.bold,
      fontSize: typography.sizes.extraLarge,
      lineHeight: typography.lineHeights.extraLarge,
      letterSpacing: 4,
      color: tokens.brand,
    },
    infoList: { gap: 10 },
    itemRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9 },
    itemDivider: { borderBottomWidth: 1, borderBottomColor: tokens.border },
    qty: {
      minWidth: moderateScale(30),
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      backgroundColor: tokens.brandSkin,
      textAlign: "center",
      fontFamily: fontFamilies.body.bold,
      fontSize: typography.sizes.small,
      color: tokens.brand,
      overflow: "hidden",
    },
    itemName: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text },
    itemPrice: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: tokens.borderStrong,
      borderStyle: "dashed",
      paddingTop: 12,
      marginTop: 4,
    },
    totalLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.text },
    totalValue: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.large, color: tokens.text },
    muted: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec },
    payment: { marginTop: 12 },
    readyHint: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec, textAlign: "center" },
    prepChips: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
    acceptDeadline: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, textAlign: "center" },
  });

export type OrderDetailStyles = ReturnType<typeof createStyles>;
