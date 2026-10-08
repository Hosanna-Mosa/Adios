import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DownloadReportDialog } from "@/components/shared/DownloadReportDialog";
import { useAnalytics } from "@/features/dashboard/hooks/useAnalytics";
import { AnalyticsHeader } from "@/features/dashboard/components/AnalyticsHeader";
import { AnalyticsStatsRow } from "@/features/dashboard/components/AnalyticsStatsRow";
import { OrdersVelocityChart } from "@/features/dashboard/components/OrdersVelocityChart";
import { AnomalyTable } from "@/features/dashboard/components/AnomalyTable";

export default function Analytics() {
  const { t } = useTranslation();
  const { rangeDays, setRangeDays, rangeLabel, summary, isDownloadOpen, setIsDownloadOpen, isLoading, isError, velocityData, anomalies, downloadData } = useAnalytics();

  return (
    <DashboardLayout searchPlaceholder={t("analytics.searchLogisticsMetrics")}>
      <div className="space-y-6">
        <AnalyticsHeader rangeDays={rangeDays} onRangeChange={setRangeDays} onExportClick={() => setIsDownloadOpen(true)} />

        <AnalyticsStatsRow summary={summary} rangeLabel={rangeLabel} />

        {/* Revenue Stream, Peak Demand Hours and the Driver Saturation map were
            removed: all three showed invented data (a W1-W4 toggle over a fixed
            "+12.4%", a Math.random() heatmap, two hardcoded map pins) that
            /admin/analytics has nothing real behind. */}
        <div className="grid grid-cols-3 gap-4">
          <OrdersVelocityChart isLoading={isLoading} isError={isError} velocityData={velocityData} rangeLabel={rangeLabel} />
        </div>

        <DownloadReportDialog open={isDownloadOpen} onOpenChange={setIsDownloadOpen} title={t("analytics.logisticsAnalyticsPerformanceReport")} data={downloadData} />

        <AnomalyTable anomalies={anomalies} isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
}
