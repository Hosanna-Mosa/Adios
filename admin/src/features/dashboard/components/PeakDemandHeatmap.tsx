import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { FadeIn } from "@/components/motion/FadeIn";
import type { HeatmapCell } from "../analyticsTypes";

interface PeakDemandHeatmapProps {
  heatmapData: HeatmapCell[];
}

/** The "Peak Demand Hours" CSS heatmap grid. */
export function PeakDemandHeatmap({ heatmapData }: PeakDemandHeatmapProps) {
  const { t } = useTranslation();
  return (
    <FadeIn className="section-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{t("analytics.peakDemandHours")}</h3>
      <div className="grid grid-cols-5 gap-1.5 mb-4">
        {heatmapData.map((cell) => (
          <div
            key={cell.id}
            className="h-8 rounded-sm cursor-pointer hover:opacity-85 transition-opacity"
            onClick={() => toast.info(t("analytics.hourBlockIntensity", { percent: Math.round(cell.intensity * 100), defaultValue: "Hour block intensity: {{percent}}% load" }))}
            style={{
              backgroundColor: `hsl(185, 80%, ${85 - cell.intensity * 55}%)`,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>06:00</span>
        <span>10:00</span>
        <span>14:00</span>
        <span>18:00</span>
        <span>22:00</span>
        <span>02:00</span>
      </div>
    </FadeIn>
  );
}
