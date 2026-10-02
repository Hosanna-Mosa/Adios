import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import { CheckCircle, UserPlus, AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import type { DashboardStats, ManifestItem } from "../types";

/** All state/query logic for Dashboard.tsx (work queue item #15). */
export function useDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [timeScale, setTimeScale] = useState<"DAILY" | "WEEKLY">("DAILY");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    // Live board: refetched on an interval and on window focus so it reflects
    // what is happening now rather than whatever was true when the tab opened.
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    queryFn: () => adminFetch<DashboardStats>("/admin/stats"),
  });

  // No hardcoded sample rows behind these any more: whatever the API returns is
  // what the dashboard shows, and nothing is what it shows when there is nothing.
  const barData = stats?.barData || [];
  const weeklyBarData = stats?.weeklyBarData || [];
  const activityLog = stats?.activityLog || [];
  // Memoised off stats itself: `stats?.manifests || []` builds a fresh array on
  // every render, which would re-run the filter below each time.
  const manifests = useMemo(() => stats?.manifests || [], [stats]);

  const visibleManifests = useMemo(() => {
    if (priorityFilter === "ALL") return manifests;
    return manifests.filter((m) => m.priority === priorityFilter);
  }, [manifests, priorityFilter]);

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

  const viewManifest = (m: ManifestItem) => navigate(`/live-orders/${m.orderId || m.id}`);

  const cancelManifest = async (m: ManifestItem) => {
    const orderId = m.orderId || m.id;
    if (!orderId) return;
    try {
      // A real state change against the order, not a toast pretending one happened.
      await adminFetch(`/admin/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      toast.success(t("dashboard.orderCancelledId", { id: orderId, defaultValue: "Order {{id}} cancelled." }));
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    } catch (err) {
      toast.error((err as Error)?.message || t("dashboard.couldNotCancelOrder"));
    }
  };

  return {
    timeScale,
    setTimeScale,
    stats,
    isLoading,
    barData,
    weeklyBarData,
    activityLog,
    manifests,
    visibleManifests,
    priorityFilter,
    setPriorityFilter,
    getActivityIcon,
    viewManifest,
    cancelManifest,
  };
}
