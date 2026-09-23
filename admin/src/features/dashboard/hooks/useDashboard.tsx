import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useJsApiLoader } from "@react-google-maps/api";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import { CheckCircle, UserPlus, AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import type { DashboardStats, DownloadRow } from "../types";

const DEFAULT_BAR_DATA = [
  { time: "08:00", delivered: 45, target: 60 },
  { time: "10:00", delivered: 80, target: 65 },
  { time: "12:00", delivered: 95, target: 70 },
  { time: "14:00", delivered: 75, target: 72 },
  { time: "16:00", delivered: 60, target: 68 },
  { time: "18:00", delivered: 85, target: 70 },
  { time: "20:00", delivered: 40, target: 55 },
];

const DEFAULT_WEEKLY_BAR_DATA = [
  { time: "Week 1", delivered: 340, target: 400 },
  { time: "Week 2", delivered: 420, target: 410 },
  { time: "Week 3", delivered: 510, target: 430 },
  { time: "Week 4", delivered: 490, target: 450 },
];

const DEFAULT_ACTIVITY_LOG = [
  { type: "DELIVERY", title: "Order #ORD-9901 Delivered", desc: "Driver: Marcus Rodriguez • 2 mins ago" },
  { type: "SYSTEM", title: "System Status: Optimal", desc: "Logistics orchestration engines running at 100%" },
  { type: "USER_REG", title: "New Driver Registered", desc: "Sarah Jenkins • Fleet A • 1 hr ago" },
];

const DEFAULT_MANIFESTS = [
  { id: "#ORD-9921", dest: "128 Tech Plaza, San Jose", driver: "Marcus Chen", eta: "14:45 PM", priority: "HIGH" },
  { id: "#ORD-9918", dest: "Port of Oakland, Terminal 3", driver: "Sarah Jenkins", eta: "15:10 PM", priority: "STANDARD" },
  { id: "#ORD-9905", dest: "Bay Area Logistics Hub", driver: "Rick Alvarez", eta: "16:30 PM", priority: "EXPRESS" },
];

/** All state/query logic for Dashboard.tsx (work queue item #15). */
export function useDashboard() {
  const { t } = useTranslation();
  const [timeScale, setTimeScale] = useState<"DAILY" | "WEEKLY">("DAILY");
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [downloadTitle, setDownloadTitle] = useState("");
  const [downloadData, setDownloadData] = useState<DownloadRow[]>([]);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyD23mZxzw78gBlz6EGEZ6BMgCwc4fygJMA",
  });

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminFetch<DashboardStats>("/admin/stats"),
  });

  const barData = stats?.barData || DEFAULT_BAR_DATA;
  const weeklyBarData = stats?.weeklyBarData || DEFAULT_WEEKLY_BAR_DATA;
  const activityLog = stats?.activityLog || DEFAULT_ACTIVITY_LOG;
  const manifests = stats?.manifests || DEFAULT_MANIFESTS;

  const getActivityIcon = (type: string): ReactNode => {
    switch (type) {
      case "DELIVERY":
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case "USER_REG":
        return <UserPlus className="h-4 w-4 text-muted-foreground" />;
      case "SYSTEM":
      default:
        return <AlertTriangle className="h-4 w-4 text-warning" />;
    }
  };

  const openOperationalReport = () => {
    setDownloadTitle(t("dashboard.operationalSummaryReport"));
    setDownloadData([
      { [t("dashboard.reportMetric")]: t("dashboard.totalOrders"), [t("dashboard.reportValue")]: stats?.totalOrders || 0 },
      { [t("dashboard.reportMetric")]: t("dashboard.activeDrivers"), [t("dashboard.reportValue")]: stats?.activeDrivers || 0 },
      { [t("dashboard.reportMetric")]: t("dashboard.totalUsers"), [t("dashboard.reportValue")]: stats?.totalUsers || 0 },
      { [t("dashboard.reportMetric")]: t("dashboard.totalRevenue"), [t("dashboard.reportValue")]: `INR ${stats?.totalRevenue || 0}` },
      { [t("dashboard.reportMetric")]: t("dashboard.reportType"), [t("dashboard.reportValue")]: t("dashboard.logisticsDashboardSummary") },
    ]);
    setIsDownloadOpen(true);
  };

  const openFleetReport = () => {
    setDownloadTitle(t("dashboard.fleetPerformanceAllocationReport"));
    setDownloadData([
      { [t("dashboard.district")]: t("dashboard.northBayDistrict"), [t("dashboard.recommDrivers")]: 12, [t("dashboard.currentStatus")]: t("dashboard.statusSurge"), [t("dashboard.efficiencyIncrease")]: "+18%" },
      { [t("dashboard.district")]: t("dashboard.downtownArea"), [t("dashboard.recommDrivers")]: 5, [t("dashboard.currentStatus")]: t("dashboard.statusOptimal"), [t("dashboard.efficiencyIncrease")]: "+10%" },
      { [t("dashboard.district")]: t("dashboard.eastCorridor"), [t("dashboard.recommDrivers")]: 8, [t("dashboard.currentStatus")]: t("dashboard.statusNormal"), [t("dashboard.efficiencyIncrease")]: "+8%" },
    ]);
    setIsDownloadOpen(true);
  };

  return {
    timeScale,
    setTimeScale,
    isDownloadOpen,
    setIsDownloadOpen,
    downloadTitle,
    downloadData,
    isLoaded,
    stats,
    isLoading,
    barData,
    weeklyBarData,
    activityLog,
    manifests,
    getActivityIcon,
    openOperationalReport,
    openFleetReport,
  };
}
