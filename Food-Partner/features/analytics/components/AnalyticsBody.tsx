import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import type { SalesAnalytics } from "@/types/insights";
import { formatCurrency } from "@/utils/format";
import type { AnalyticsStyles } from "../analytics.styles";
import { SalesChart } from "./SalesChart";

interface Props {
  data: SalesAnalytics;
  styles: AnalyticsStyles;
}

/** The figures: revenue, orders, average order, cancellations, the daily chart and the best-selling items. */
export function AnalyticsBody({ data, styles }: Props) {
  const { t } = useTranslation();
  const { totals } = data;
  return (
    <>
      <View style={styles.grid}>
        <StatCard style={styles.cell} icon="cash-outline" tone="success" label={t("analytics.revenue")} value={formatCurrency(totals.sales)} />
        <StatCard style={styles.cell} icon="receipt-outline" tone="info" label={t("analytics.orders")} value={String(totals.orders)} />
        <StatCard style={styles.cell} icon="pricetag-outline" label={t("analytics.avgOrder")} value={formatCurrency(totals.avgOrderValue)} />
        <StatCard
          style={styles.cell}
          icon="close-circle-outline"
          tone={totals.cancelled ? "error" : "neutral"}
          label={t("analytics.cancellations")}
          value={String(totals.cancelled)}
          hint={t("analytics.cancellationRate", { rate: totals.cancellationRate })}
        />
      </View>

      <SalesChart days={data.days} styles={styles} />

      <SectionHeader title={t("analytics.topItems")} />
      <Card bordered elevationLevel="none" style={styles.card}>
        {data.topItems.length === 0 ? (
          <EmptyState compact icon="restaurant-outline" title={t("analytics.noItems")} subtitle={t("analytics.noItemsHint")} />
        ) : (
          data.topItems.map((item, index) => (
            <View key={item.name} style={styles.itemRow}>
              <Text style={styles.rank}>{index + 1}</Text>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemMeta}>
                {t("analytics.sold", { count: item.quantity })} · {formatCurrency(item.sales)}
              </Text>
            </View>
          ))
        )}
      </Card>

      <Text style={styles.hint}>{t("analytics.note")}</Text>
      {data.truncated ? <Text style={styles.hint}>{t("analytics.truncated")}</Text> : null}
    </>
  );
}
