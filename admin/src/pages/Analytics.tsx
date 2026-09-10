import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DownloadReportDialog } from "@/components/shared/DownloadReportDialog";
import { useAnalytics } from "@/features/dashboard/hooks/useAnalytics";
import { AnalyticsHeader } from "@/features/dashboard/components/AnalyticsHeader";
import { AnalyticsStatsRow } from "@/features/dashboard/components/AnalyticsStatsRow";
import { OrdersVelocityChart } from "@/features/dashboard/components/OrdersVelocityChart";
import { RevenueStreamPanel } from "@/features/dashboard/components/RevenueStreamPanel";
import { PeakDemandHeatmap } from "@/features/dashboard/components/PeakDemandHeatmap";
import { DriverSaturationMap } from "@/features/dashboard/components/DriverSaturationMap";
import { AnomalyTable } from "@/features/dashboard/components/AnomalyTable";

export default function Analytics() {
  const { selectedWeek, handleSelectWeek, timeRange, handleRangeChange, isDownloadOpen, setIsDownloadOpen, isLoaded, isLoading, velocityData, heatmapData, anomalies, downloadData } = useAnalytics();

  return (
    <DashboardLayout searchPlaceholder="Search logistics metrics...">
      <div className="space-y-6">
        <AnalyticsHeader timeRange={timeRange} onRangeChange={handleRangeChange} onExportClick={() => setIsDownloadOpen(true)} />

        <AnalyticsStatsRow />

        <div className="grid grid-cols-3 gap-4">
          <OrdersVelocityChart isLoading={isLoading} velocityData={velocityData} />
          <RevenueStreamPanel selectedWeek={selectedWeek} onSelectWeek={handleSelectWeek} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <PeakDemandHeatmap heatmapData={heatmapData} />
          <DriverSaturationMap isLoaded={isLoaded} />
        </div>

        <DownloadReportDialog open={isDownloadOpen} onOpenChange={setIsDownloadOpen} title="Logistics Analytics Performance Report" data={downloadData} />

        <AnomalyTable anomalies={anomalies} />
      </div>
    </DashboardLayout>
  );
}
