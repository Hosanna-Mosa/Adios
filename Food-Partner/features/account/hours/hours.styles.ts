import { StyleSheet } from "react-native";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/opening-hours.tsx. Cards are ui/Card, switches ui/ToggleSwitch, chips ui/Chip.
export const createHoursStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 12 },
    intro: { gap: 8 },
    hint: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.sec },
    day: { gap: 12 },
    dayHead: { flexDirection: "row", alignItems: "center", gap: 10 },
    dayTexts: { flex: 1, minWidth: 0, gap: 2 },
    dayName: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.text },
    daySummary: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.sec },
    todayTag: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: tokens.brand },
    times: { flexDirection: "row", gap: 10 },
    time: { flex: 1, gap: 6 },
    timeLabel: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.muted },
    dayActions: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
    nextDay: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.info },
    // Time picker sheet
    pickerBody: { gap: 14, paddingTop: 12 },
    pickerLabel: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    preview: {
      fontFamily: fontFamilies.heading.bold,
      fontSize: typography.sizes.extraLarge,
      lineHeight: typography.lineHeights.extraLarge,
      color: tokens.text,
      textAlign: "center",
    },
    pickerActions: { flexDirection: "row", gap: 10, marginTop: 6 },
    pickerAction: { flex: 1 },
  });

export type HoursStyles = ReturnType<typeof createHoursStyles>;
