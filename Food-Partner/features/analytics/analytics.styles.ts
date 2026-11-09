import { StyleSheet } from "react-native";
import { radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/analytics.tsx.
export const createAnalyticsStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 14 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    cell: { width: "48%", flexGrow: 1 },
    card: { gap: 12 },
    cardTitle: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    hint: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.muted },
    chart: { flexDirection: "row", alignItems: "flex-end", gap: 4, height: 130 },
    barSlot: { flex: 1, height: "100%", justifyContent: "flex-end", alignItems: "center" },
    bar: { width: "100%", borderRadius: radius.sm, backgroundColor: tokens.brand, minHeight: 2 },
    barEmpty: { backgroundColor: tokens.border },
    axis: { flexDirection: "row", justifyContent: "space-between" },
    axisLabel: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.muted },
    itemRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    rank: { width: 22, fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.muted },
    itemName: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text },
    itemMeta: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.sec },
  });

export type AnalyticsStyles = ReturnType<typeof createAnalyticsStyles>;
