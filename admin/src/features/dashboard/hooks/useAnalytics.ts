import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useJsApiLoader } from "@react-google-maps/api";
import { toast } from "sonner";
import { adminFetch } from "@/lib/api-client";
import type { AnalyticsData } from "../analyticsTypes";

const TIME_RANGES = ["Last 7 Days", "Last 30 Days", "Last 90 Days", "Year to Date"];

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
    setTimeRange(TIME_RANGES[nextIndex]);
    toast.success(`Analytics dashboard updated for: ${TIME_RANGES[nextIndex]}`);
  };

  const handleSelectWeek = (w: string) => {
    setSelectedWeek(w);
    toast.success(`Revenue stream updated for week: ${w}`);
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
    { Metric: "Total Orders", Value: "12,842" },
    { Metric: "Net Revenue", Value: "INR 482.5k" },
    { Metric: "Avg. Delivery Time", Value: "34.2m" },
    { Metric: "Active Drivers", Value: "842" },
    ...anomalies.map((a) => ({
      Metric: `Anomaly: ${a.id} (${a.driver})`,
      Value: `${a.status} - ${a.activity}`,
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
