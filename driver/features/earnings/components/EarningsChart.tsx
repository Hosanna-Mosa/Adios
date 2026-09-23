import React from "react";
import { StyleSheet } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { useTranslation } from "react-i18next";
import Colors from "@/constants/colors";
import { typography } from "@/constants/typography";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

interface EarningsChartProps {
  data: { day: string; amount: number }[];
  height?: number;
}

// `day` values from the API stay as English abbreviations (Mon..Sun); only
// the displayed label is translated.
const DAY_LABEL_KEY: Record<string, string> = {
  Mon: "earnings.dayMon",
  Tue: "earnings.dayTue",
  Wed: "earnings.dayWed",
  Thu: "earnings.dayThu",
  Fri: "earnings.dayFri",
  Sat: "earnings.daySat",
  Sun: "earnings.daySun",
};

export function EarningsChart({ data, height = 160 }: EarningsChartProps) {
  const { t } = useTranslation();
  const maxAmount = Math.max(...data.map((d) => d.amount));
  const barWidth = 28;
  const gap = 10;
  const chartWidth = data.length * (barWidth + gap) - gap;

  return (
    <Box style={styles.container}>
      <AppText style={styles.title}>{t("earnings.thisWeek")}</AppText>
      <Box style={styles.chartArea}>
        <Svg width={chartWidth} height={height - 30}>
          {data.map((item, index) => {
            const barHeight = (item.amount / maxAmount) * (height - 50);
            const x = index * (barWidth + gap);
            const y = height - 40 - barHeight;
            const isToday = index === data.length - 1;

            return (
              <React.Fragment key={item.day}>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={4}
                  fill={isToday ? Colors.primary : Colors.surfaceContainerHigh}
                />
              </React.Fragment>
            );
          })}
        </Svg>
        <Box style={styles.labelsRow}>
          {data.map((item, index) => (
            <Box key={item.day} style={{ width: barWidth, marginHorizontal: gap / 2 }}>
              <AppText style={[styles.label, index === data.length - 1 && styles.labelToday]}>
                {DAY_LABEL_KEY[item.day] ? t(DAY_LABEL_KEY[item.day]) : item.day}
              </AppText>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontWeight: "600",
    fontSize: typography.sizes.medium,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.05,
    marginBottom: 14,
  },
  chartArea: {
    alignItems: "center",
  },
  labelsRow: {
    flexDirection: "row",
    marginTop: 6,
  },
  label: {
    fontWeight: "500",
    fontSize: typography.sizes.small,
    color: Colors.textMuted,
    textAlign: "center",
  },
  labelToday: {
    color: Colors.primary,
    fontWeight: "600",
  },
});
