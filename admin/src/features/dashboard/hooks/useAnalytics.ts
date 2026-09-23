import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useJsApiLoader } from "@react-google-maps/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import type { AnalyticsData } from "../analyticsTypes";

const TIME_RANGES = ["Last 7 Days", "Last 30 Days", "Last 90 Days", "Year to Date"];

const TIME_RANGE_LABEL_KEY: Record<string, string> = {
  "Last 7 Days": "analytics.last7Days",
  "Last 30 Days": "analytics.last30Days",
  "Last 90 Days": "analytics.last90Days",
  "Year to Date": "analytics.yearToDate",
};

/** Translated display label for a time-range value — the value itself
 * (used for state and cycling via TIME_RANGES.indexOf) is never translated. */
export const timeRangeLabel = (range: string, t: (key: string) => string): string =>
  TIME_RANGE_LABEL_KEY[range] ? t(TIME_RANGE_LABEL_KEY[range]) : range;

const DEFAULT_VELOCITY_DATA = [
  { day: "MON", orders: 1800 },
  { day: "TUE", orders: 2200 },
  { day: "WED", orders: 2600 },
  { day: "THU", orders: 2842 },
  { day: "FRI", orders: 2400 },
  { day: "SAT", orders: 3200 },
  { day: "SUN", orders: 2800 },
];

const DEFAULT_ANOMALIES = [
  { id: "#PN-9284-A", status: "Optimal", statusVariant: "optimal" as const, driver: "Marcus Chen", value: "₹4,281.00", activity: "Arrived at Hub B" },
  { id: "#PN-9285-C", status: "Minor Delay", statusVariant: "delay" as const, driver: "Sarah Jenkins", value: "₹12,940.50", activity: "Heavy Traffic (Exit 4)" },
  { id: "#PN-9286-K", status: "In-Transit", statusVariant: "transit" as const, driver: "David Miller", value: "₹842.12", activity: "Loading Dock 4" },
];

/** All state/query logic for Analytics.tsx (work queue item #17). */
export function useAnalytics() {
  const { t } = useTranslation();
  const [selectedWeek, setSelectedWeek] = useState("W3");
  const [timeRange, setTimeRange] = useState("Last 30 Days");
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyD23mZxzw78gBlz6EGEZ6BMgCwc4fygJMA",
  });

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: () => adminFetch<AnalyticsData>("/admin/analytics"),
  });

  const handleRangeChange = () => {
    const nextIndex = (TIME_RANGES.indexOf(timeRange) + 1) % TIME_RANGES.length;
    const nextRange = TIME_RANGES[nextIndex];
    setTimeRange(nextRange);
    toast.success(t("analytics.dashboardUpdatedFor", { range: timeRangeLabel(nextRange, t), defaultValue: "Analytics dashboard updated for: {{range}}" }));
  };

  const handleSelectWeek = (w: string) => {
    setSelectedWeek(w);
    toast.success(t("analytics.revenueStreamUpdatedForWeek", { week: w, defaultValue: "Revenue stream updated for week: {{week}}" }));
  };

  const velocityData = analyticsData?.velocityData || DEFAULT_VELOCITY_DATA;

  const heatmapData =
    analyticsData?.heatmapData ||
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      intensity: Math.random(),
    }));

  const anomalies = analyticsData?.anomalies || DEFAULT_ANOMALIES;

  const downloadData = [
    { [t("dashboard.reportMetric")]: t("analytics.totalOrders"), [t("dashboard.reportValue")]: "12,842" },
    { [t("dashboard.reportMetric")]: t("analytics.netRevenue"), [t("dashboard.reportValue")]: "INR 482.5k" },
    { [t("dashboard.reportMetric")]: t("analytics.avgDeliveryTime"), [t("dashboard.reportValue")]: "34.2m" },
    { [t("dashboard.reportMetric")]: t("dashboard.activeDrivers"), [t("dashboard.reportValue")]: "842" },
    ...anomalies.map((a) => ({
      [t("dashboard.reportMetric")]: t("analytics.anomalyMetric", { id: a.id, driver: a.driver, defaultValue: "Anomaly: {{id}} ({{driver}})" }),
      [t("dashboard.reportValue")]: `${a.status} - ${a.activity}`,
    })),
  ];

  return {
    selectedWeek,
    handleSelectWeek,
    timeRange,
    handleRangeChange,
    isDownloadOpen,
    setIsDownloadOpen,
    isLoaded,
    isLoading,
    velocityData,
    heatmapData,
    anomalies,
    downloadData,
  };
}
