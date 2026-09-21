import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FadeIn } from "@/components/motion/FadeIn";
import type { VelocityDatum } from "../analyticsTypes";

interface OrdersVelocityChartProps {
  isLoading: boolean;
  velocityData: VelocityDatum[];
}

/** The "Orders Velocity" area chart panel. */
export function OrdersVelocityChart({ isLoading, velocityData }: OrdersVelocityChartProps) {
  return (
    <FadeIn className="col-span-2 section-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Orders Velocity</h3>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success" />
          <span className="text-xs text-muted-foreground">Last 7 Days</span>
        </div>
      </div>
      {isLoading ? (
        <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">Loading velocity...</div>
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
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(214,20%,90%)", fontSize: 12 }} formatter={(value: number) => [`${value.toLocaleString()} Orders`, ""]} />
            <Area type="monotone" dataKey="orders" stroke="hsl(185, 80%, 28%)" strokeWidth={2.5} fill="url(#colorOrders)" dot={{ r: 4, fill: "hsl(185, 80%, 28%)", strokeWidth: 2, stroke: "#fff" }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </FadeIn>
  );
}
