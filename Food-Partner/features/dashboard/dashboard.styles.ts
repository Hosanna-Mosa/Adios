import { StyleSheet } from "react-native";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

export const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    content: { paddingHorizontal: 16 },
    section: { marginTop: 24 },

    header: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 8, paddingBottom: 4 },
    headerTexts: { flex: 1, minWidth: 0 },
    greeting: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },
    outletName: {
      fontFamily: fontFamilies.heading.bold,
      fontSize: typography.sizes.extraLarge,
      lineHeight: typography.lineHeights.extraLarge,
      letterSpacing: -0.4,
      color: tokens.text,
      marginTop: 2,
    },
    roleRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 8 },

    statsGrid: { gap: 12, marginTop: 20 },
    row: { flexDirection: "row", gap: 12 },
    quickRow: { flexDirection: "row", gap: 8, marginTop: 4 },
    banner: { marginTop: 16 },
    list: { gap: 12 },
  });

export type DashboardStyles = ReturnType<typeof createStyles>;
