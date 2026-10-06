import { StyleSheet } from "react-native";
import { radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

export const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    content: { paddingHorizontal: 16 },
    section: { marginTop: 24 },
    note: { marginTop: 16 },

    balanceCard: { gap: 6, marginTop: 8 },
    balanceLabel: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },
    balanceValue: {
      fontFamily: fontFamilies.heading.bold,
      fontSize: typography.sizes.extraLarge,
      lineHeight: typography.lineHeights.extraLarge,
      letterSpacing: -0.4,
      color: tokens.text,
    },
    transit: { flexDirection: "row", marginTop: 2 },
    requestButton: { marginTop: 12 },
    blocker: {
      fontFamily: fontFamilies.body.regular,
      fontSize: typography.sizes.small,
      lineHeight: typography.lineHeights.small,
      color: tokens.muted,
      textAlign: "center",
      marginTop: 6,
    },
    statsRow: { flexDirection: "row", gap: 12, marginTop: 12 },
    flex: { flex: 1 },

    list: { gap: 12 },
    payoutCard: { gap: 8 },
    payoutTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
    payoutAmount: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.large, color: tokens.text },
    payoutMeta: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.sec },
    payoutReference: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.small, color: tokens.muted, letterSpacing: 0.4 },
    payoutFailed: {
      fontFamily: fontFamilies.body.medium,
      fontSize: typography.sizes.small,
      lineHeight: typography.lineHeights.small,
      color: tokens.error,
      backgroundColor: tokens.errorSkin,
      borderRadius: radius.sm,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },

    sheetBody: { gap: 12, marginTop: 18, marginBottom: 6 },
    currency: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.sec },

    skeleton: { gap: 12, marginTop: 8 },
  });

export type PayoutsStyles = ReturnType<typeof createStyles>;
