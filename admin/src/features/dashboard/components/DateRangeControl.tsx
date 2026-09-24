import { Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { timeRangeLabel } from "../hooks/useAnalytics";

interface DateRangeControlProps {
  timeRange: string;
  onCycle: () => void;
}

/** Cycles through a fixed set of preset date ranges on click. */
export function DateRangeControl({ timeRange, onCycle }: DateRangeControlProps) {
  const { t } = useTranslation();
  return (
    <button onClick={onCycle} className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 transition-all">
      <Calendar className="h-4 w-4" /> {timeRangeLabel(timeRange, t)}
    </button>
  );
}
