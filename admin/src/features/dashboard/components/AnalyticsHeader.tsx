import { Download } from "lucide-react";
import { DateRangeControl } from "./DateRangeControl";

interface AnalyticsHeaderProps {
  timeRange: string;
  onRangeChange: () => void;
  onExportClick: () => void;
}

/** The Analytics page header: title, date-range cycler, and export trigger. */
export function AnalyticsHeader({ timeRange, onRangeChange, onExportClick }: AnalyticsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="page-header">Analytics Performance</h1>
        <p className="page-subtitle">Real-time logistics intelligence and fleet efficiency metrics.</p>
      </div>
      <div className="flex gap-3">
        <DateRangeControl timeRange={timeRange} onCycle={onRangeChange} />
        <button onClick={onExportClick} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
          <Download className="h-4 w-4" /> Export Report
        </button>
      </div>
    </div>
  );
}
