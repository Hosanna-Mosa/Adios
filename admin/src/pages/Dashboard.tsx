import { DashboardLayout } from "@/components/layout/DashboardLayout";
// Unused in the original page too -- kept as a faithful move, not cleaned up.
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DownloadReportDialog } from "@/components/shared/DownloadReportDialog";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { MetricsRow } from "@/features/dashboard/components/MetricsRow";
import { DeliveryPerformanceChart } from "@/features/dashboard/components/DeliveryPerformanceChart";
import { LiveActivityLog } from "@/features/dashboard/components/LiveActivityLog";
import { LiveFleetMap } from "@/features/dashboard/components/LiveFleetMap";
import { FleetInsightPanel } from "@/features/dashboard/components/FleetInsightPanel";
import { ActiveManifestsTable } from "@/features/dashboard/components/ActiveManifestsTable";

export default function Dashboard() {
  const {
    timeScale,
    setTimeScale,
    isDownloadOpen,
    setIsDownloadOpen,
    downloadTitle,
    downloadData,
    isLoaded,
    stats,
    barData,
    weeklyBarData,
    activityLog,
    manifests,
    getActivityIcon,
    openOperationalReport,
    openFleetReport,
  } = useDashboard();

  return (
    <DashboardLayout searchPlaceholder="Search orders, drivers, or routes...">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-header">Operational Overview</h1>
            <p className="page-subtitle">Real-time supply chain performance metrics.</p>
          </div>
          <button onClick={openOperationalReport} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
            Generate Report
          </button>
        </div>

        <MetricsRow stats={stats} />

        <div className="grid grid-cols-3 gap-4">
          <DeliveryPerformanceChart timeScale={timeScale} onTimeScaleChange={setTimeScale} barData={barData} weeklyBarData={weeklyBarData} />
          <LiveActivityLog activityLog={activityLog} getActivityIcon={getActivityIcon} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <LiveFleetMap isLoaded={isLoaded} />
          <FleetInsightPanel onGenerateReport={openFleetReport} />
        </div>

        <DownloadReportDialog open={isDownloadOpen} onOpenChange={setIsDownloadOpen} title={downloadTitle} data={downloadData} />

        <ActiveManifestsTable manifests={manifests} />
      </div>
    </DashboardLayout>
  );
}
