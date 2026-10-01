import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { MetricsRow } from "@/features/dashboard/components/MetricsRow";
import { DeliveryPerformanceChart } from "@/features/dashboard/components/DeliveryPerformanceChart";
import { LiveActivityLog } from "@/features/dashboard/components/LiveActivityLog";
import { ActiveManifestsTable } from "@/features/dashboard/components/ActiveManifestsTable";

export default function Dashboard() {
  const { t } = useTranslation();
  const {
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
  } = useDashboard();

  return (
    <DashboardLayout searchPlaceholder={t("dashboard.searchPlaceholder")}>
      <div className="space-y-6">
        {/* "Generate Report", the fleet map with its two hardcoded pins, and the
            "System Insight" card (a fixed "18% more efficient" claim plus a
            canned fleet report) were removed — none was backed by real data. */}
        <div>
          <h1 className="page-header">{t("dashboard.operationalOverview")}</h1>
          <p className="page-subtitle">{t("dashboard.realTimeSupplyChainMetrics")}</p>
        </div>

        <MetricsRow stats={stats} />

        <div className="grid grid-cols-3 gap-4">
          <DeliveryPerformanceChart timeScale={timeScale} onTimeScaleChange={setTimeScale} barData={barData} weeklyBarData={weeklyBarData} />
          <LiveActivityLog activityLog={activityLog} isLoading={isLoading} getActivityIcon={getActivityIcon} />
        </div>

        <ActiveManifestsTable
          manifests={visibleManifests}
          totalCount={manifests.length}
          isLoading={isLoading}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          onView={viewManifest}
          onCancel={cancelManifest}
        />
      </div>
    </DashboardLayout>
  );
}
