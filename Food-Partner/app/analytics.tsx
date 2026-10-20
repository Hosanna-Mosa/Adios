import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ChipRow } from "@/components/ui/ChipRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { Header } from "@/components/ui/Header";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { AnalyticsBody } from "@/features/analytics/components/AnalyticsBody";
import { ANALYTICS_RANGES, useAnalytics } from "@/features/analytics/useAnalytics";
import type { AnalyticsRange } from "@/types/insights";

/** Sales analytics: revenue and orders by day, best-selling items and cancellations. */
export default function AnalyticsScreen() {
  const { t } = useTranslation();
  const a = useAnalytics();
  const header = <Header title={t("analytics.title")} onBack={() => router.back()} />;

  return (
    <ScreenShell
      style={{ paddingTop: a.insets.top + 8 }}
      header={header}
      scroll
      refreshing={a.refreshing}
      onRefresh={() => a.refetch()}
      contentStyle={[a.styles.content, { paddingBottom: 24 + a.insets.bottom }]}
    >
      <ChipRow
        topGap={0}
        value={String(a.range)}
        onChange={(key) => a.setRange(Number(key) as AnalyticsRange)}
        options={ANALYTICS_RANGES.map((days) => ({ key: String(days), label: t("analytics.lastDays", { count: days }) }))}
      />
      {a.loading ? (
        <FullScreenLoader color={a.tokens.brand} style={{ paddingVertical: 60 }} />
      ) : a.error || !a.data ? (
        <EmptyState icon="cloud-offline-outline" title={t("errors.loadFailed")} subtitle={t("errors.checkConnection")} actionLabel={t("actions.tryAgain")} onAction={() => a.refetch()} />
      ) : (
        <AnalyticsBody data={a.data} styles={a.styles} />
      )}
    </ScreenShell>
  );
}
