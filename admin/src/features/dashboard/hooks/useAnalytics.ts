import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import type { AnalyticsData, AnalyticsSummary } from "../analyticsTypes";

/** The selectable date ranges, in days, and their label keys. */
export const RANGE_OPTIONS: { days: number; labelKey: string }[] = [
  { days: 7, labelKey: "analytics.last7Days" },
  { days: 30, labelKey: "analytics.last30Days" },
  { days: 90, labelKey: "analytics.last90Days" },
  { days: 365, labelKey: "analytics.last12Months" },
];

/** Translated display label for a range in days. */
export const rangeDaysLabel = (days: number, t: (key: string) => string): string => {
  const option = RANGE_OPTIONS.find((o) => o.days === days) ?? RANGE_OPTIONS[RANGE_OPTIONS.length - 1];
  return t(option.labelKey);
};

/** All state/query logic for Analytics.tsx (work queue item #17). */
export function useAnalytics() {
  const { t } = useTranslation();
  const [rangeDays, setRangeDays] = useState(30);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  const { data: analyticsData, isLoading, isError } = useQuery({
    // rangeDays is part of the key, so changing the range actually refetches.
    queryKey: ["admin", "analytics", rangeDays],
    queryFn: () => adminFetch<AnalyticsData>(`/admin/analytics?days=${rangeDays}`),
  });

  const rangeLabel = rangeDaysLabel(rangeDays, t);
  const summary: AnalyticsSummary = analyticsData?.summary || {};

  // Real per-day counts only. A failed request used to fall back to a fixed
  // MON-SUN series (1,800-3,200 orders a day); the chart now says it failed.
  const velocityData = analyticsData?.velocityData || [];

  // Real stuck orders only — this used to fall back to three invented shipments,
  // so a healthy system still displayed a feed of anomalies.
  const anomalies = analyticsData?.anomalies || [];

  const downloadData = [
    { [t("dashboard.reportMetric")]: t("analytics.range"), [t("dashboard.reportValue")]: rangeLabel },
    { [t("dashboard.reportMetric")]: t("analytics.totalOrders"), [t("dashboard.reportValue")]: String(summary.totalOrders ?? 0) },
    { [t("dashboard.reportMetric")]: t("analytics.netRevenue"), [t("dashboard.reportValue")]: `INR ${(summary.netRevenue ?? 0).toLocaleString()}` },
    {
      [t("dashboard.reportMetric")]: t("analytics.avgDeliveryTime"),
      [t("dashboard.reportValue")]: summary.avgDeliveryMinutes ? `${summary.avgDeliveryMinutes}m` : t("analytics.notAvailable"),
    },
    { [t("dashboard.reportMetric")]: t("dashboard.activeDrivers"), [t("dashboard.reportValue")]: String(summary.activeDrivers ?? 0) },
    ...anomalies.map((a) => ({
      [t("dashboard.reportMetric")]: t("analytics.anomalyMetric", { id: a.id, driver: a.driver, defaultValue: "Anomaly: {{id}} ({{driver}})" }),
      [t("dashboard.reportValue")]: `${a.status} - ${a.activity}`,
    })),
  ];

  return {
    rangeDays,
    setRangeDays,
    rangeLabel,
    summary,
    isDownloadOpen,
    setIsDownloadOpen,
    isLoading,
    isError,
    velocityData,
    anomalies,
    downloadData,
  };
}
