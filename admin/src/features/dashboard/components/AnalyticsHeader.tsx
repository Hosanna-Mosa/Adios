import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DateRangeControl } from "./DateRangeControl";

interface AnalyticsHeaderProps {
  rangeDays: number;
  onRangeChange: (days: number) => void;
  onExportClick: () => void;
}

/** The Analytics page header: title, date-range picker, and export trigger. */
export function AnalyticsHeader({ rangeDays, onRangeChange, onExportClick }: AnalyticsHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="page-header">{t("analytics.analyticsPerformance")}</h1>
        <p className="page-subtitle">{t("analytics.realTimeLogisticsIntelligence")}</p>
      </div>
      <div className="flex gap-3">
        <DateRangeControl rangeDays={rangeDays} onChange={onRangeChange} />
        <button onClick={onExportClick} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
          <Download className="h-4 w-4" /> {t("downloadReport.exportReport")}
        </button>
      </div>
    </div>
  );
}
