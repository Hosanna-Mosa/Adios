import { Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RANGE_OPTIONS } from "../hooks/useAnalytics";

interface DateRangeControlProps {
  rangeDays: number;
  onChange: (days: number) => void;
}

/** A preset date-range picker; changing it refetches analytics for that range. */
export function DateRangeControl({ rangeDays, onChange }: DateRangeControlProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <label htmlFor="analytics-range" className="sr-only">
        {t("analytics.dateRange")}
      </label>
      <select
        id="analytics-range"
        value={rangeDays}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-transparent text-sm font-medium text-foreground outline-none cursor-pointer"
      >
        {RANGE_OPTIONS.map((o) => (
          <option key={o.days} value={o.days}>
            {t(o.labelKey)}
          </option>
        ))}
      </select>
    </div>
  );
}
