import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTranslation } from "react-i18next";
import { FadeIn } from "@/components/motion/FadeIn";
import type { VelocityDatum } from "../analyticsTypes";

interface OrdersVelocityChartProps {
  isLoading: boolean;
  isError: boolean;
  velocityData: VelocityDatum[];
  rangeLabel: string;
}

/**
 * The "Orders Velocity" area chart panel. Spans the full row: the Revenue
 * Stream card that sat beside it was a fake W1-W4 toggle with a hardcoded
 * growth figure, and was removed.
 */
export function OrdersVelocityChart({ isLoading, isError, velocityData, rangeLabel }: OrdersVelocityChartProps) {
  const { t } = useTranslation();
  return (
    <FadeIn className="col-span-3 section-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{t("analytics.ordersVelocity")}</h3>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success" />
          <span className="text-xs text-muted-foreground">{rangeLabel}</span>
        </div>
      </div>
      {isLoading ? (
        <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">{t("analytics.loadingVelocity")}</div>
      ) : isError || velocityData.length === 0 ? (
        <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
          {isError ? t("analytics.velocityLoadFailed") : t("analytics.noVelocityData")}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={velocityData}>
            <defs>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(185, 80%, 28%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(185, 80%, 28%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(215,15%,50%)" }} />
            <YAxis hide />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(214,20%,90%)", fontSize: 12 }} formatter={(value: number) => [t("analytics.nOrders", { count: value.toLocaleString(), defaultValue: "{{count}} Orders" }), ""]} />
            <Area type="monotone" dataKey="orders" stroke="hsl(185, 80%, 28%)" strokeWidth={2.5} fill="url(#colorOrders)" dot={{ r: 4, fill: "hsl(185, 80%, 28%)", strokeWidth: 2, stroke: "#fff" }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </FadeIn>
  );
}
