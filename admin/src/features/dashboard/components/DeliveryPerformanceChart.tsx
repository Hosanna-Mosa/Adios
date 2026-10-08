import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTranslation } from "react-i18next";
import { FadeIn } from "@/components/motion/FadeIn";
import type { BarDatum } from "../types";

interface DeliveryPerformanceChartProps {
  timeScale: "DAILY" | "WEEKLY";
  onTimeScaleChange: (scale: "DAILY" | "WEEKLY") => void;
  barData: BarDatum[];
  weeklyBarData: BarDatum[];
}

/**
 * The "Delivery Performance" bar chart panel with a Daily/Weekly toggle. Shows
 * delivered counts only: the paler "target" bars beside them were an invented
 * baseline (the backend made them up from the delivered count), so they and
 * the "vs Target" subtitle were removed.
 */
export function DeliveryPerformanceChart({ timeScale, onTimeScaleChange, barData, weeklyBarData }: DeliveryPerformanceChartProps) {
  const { t } = useTranslation();
  const data = timeScale === "DAILY" ? barData : weeklyBarData;
  return (
    <FadeIn className="col-span-2 section-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{t("dashboard.deliveryPerformance")}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{timeScale === "DAILY" ? t("dashboard.last24Hours") : t("dashboard.last4Weeks")}</p>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-0.5">
          <button
            onClick={() => onTimeScaleChange("WEEKLY")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${timeScale === "WEEKLY" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted-foreground/10"}`}
          >
            {t("dashboard.weekly")}
          </button>
          <button
            onClick={() => onTimeScaleChange("DAILY")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${timeScale === "DAILY" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted-foreground/10"}`}
          >
            {t("dashboard.daily")}
          </button>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">{t("dashboard.noDeliveryDataYet")}</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barGap={4}>
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} />
            <YAxis hide allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(214,20%,90%)", fontSize: 12 }} />
            <Bar dataKey="delivered" fill="hsl(185, 80%, 28%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </FadeIn>
  );
}
