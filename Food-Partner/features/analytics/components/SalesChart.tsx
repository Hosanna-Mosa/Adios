import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import type { DayPoint } from "@/types/insights";
import { formatCurrency } from "@/utils/format";
import type { AnalyticsStyles } from "../analytics.styles";

/** "12 Mar" from "2026-03-12". */
const shortDate = (date: string) => {
  const [, month, day] = date.split("-");
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${Number(day)} ${names[Number(month) - 1] ?? ""}`;
};

/** One bar per day, tallest = the best day. 90-day periods are grouped by week so the bars stay readable. */
export function SalesChart({ days, styles }: { days: DayPoint[]; styles: AnalyticsStyles }) {
  const { t } = useTranslation();
  const size = days.length > 31 ? 7 : 1;
  const buckets: DayPoint[] = [];
  for (let i = 0; i < days.length; i += size) {
    const part = days.slice(i, i + size);
    buckets.push({ date: part[0].date, orders: part.reduce((s, d) => s + d.orders, 0), sales: part.reduce((s, d) => s + d.sales, 0) });
  }
  const best = Math.max(0, ...buckets.map((b) => b.sales));
  const bestDay = buckets.find((b) => b.sales === best && best > 0);

  return (
    <Card bordered elevationLevel="none" style={styles.card}>
      <Text style={styles.cardTitle}>{t("analytics.salesOverTime")}</Text>
      <View style={styles.chart}>
        {buckets.map((b) => (
          <View key={b.date} style={styles.barSlot}>
            <View style={[styles.bar, b.sales <= 0 && styles.barEmpty, { height: best > 0 ? `${Math.max(2, (b.sales / best) * 100)}%` : 2 }]} />
          </View>
        ))}
      </View>
      <View style={styles.axis}>
        <Text style={styles.axisLabel}>{shortDate(buckets[0]?.date ?? "")}</Text>
        <Text style={styles.axisLabel}>{shortDate(buckets[buckets.length - 1]?.date ?? "")}</Text>
      </View>
      {bestDay ? <Text style={styles.hint}>{t("analytics.bestDay", { date: shortDate(bestDay.date), amount: formatCurrency(bestDay.sales) })}</Text> : null}
    </Card>
  );
}
