import { useTranslation } from "react-i18next";
import { FadeIn } from "@/components/motion/FadeIn";

interface FleetInsightPanelProps {
  onGenerateReport: () => void;
}

/** The "System Insight" panel with its own fleet-allocation report generator. */
export function FleetInsightPanel({ onGenerateReport }: FleetInsightPanelProps) {
  const { t } = useTranslation();
  return (
    <FadeIn delay={0.05} className="section-card p-6 bg-primary text-primary-foreground flex flex-col justify-between">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-primary-foreground/70">{t("dashboard.systemInsight")}</p>
        <h3 className="text-xl font-bold mt-1">{t("dashboard.optimizedFleetPerformance")}</h3>
        <p className="text-sm mt-3 text-primary-foreground/80 leading-relaxed">
          {t("dashboard.fleetInsightDesc")}
        </p>
      </div>
      <button onClick={onGenerateReport} className="mt-4 self-start px-5 py-2.5 bg-card text-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
        {t("dashboard.generateFleetReport")}
      </button>
    </FadeIn>
  );
}
