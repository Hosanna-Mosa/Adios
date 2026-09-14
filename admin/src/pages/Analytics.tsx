import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { fadeIn } from "@/components/motion/variants";
import { Calendar, Download } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-client";
import { DownloadReportDialog } from "@/components/shared/DownloadReportDialog";

export default function Analytics() {
  const [rangeDays, setRangeDays] = useState(30);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  const { data: analyticsData, isLoading } = useQuery({
    // rangeDays is part of the key, so changing the range actually refetches.
    queryKey: ["admin", "analytics", rangeDays],
    queryFn: () => adminFetch<any>(`/admin/analytics?days=${rangeDays}`),
  });



  const rangeLabel =
    rangeDays === 7 ? "Last 7 days" :
    rangeDays === 30 ? "Last 30 days" :
    rangeDays === 90 ? "Last 90 days" : "Last 12 months";

  const summary = analyticsData?.summary || {};

  const velocityData = analyticsData?.velocityData || [
    { day: "MON", orders: 1800 },
    { day: "TUE", orders: 2200 },
    { day: "WED", orders: 2600 },
    { day: "THU", orders: 2842 },
    { day: "FRI", orders: 2400 },
    { day: "SAT", orders: 3200 },
    { day: "SUN", orders: 2800 },
  ];

  // Real stuck orders only — this used to fall back to three invented shipments,
  // so a healthy system still displayed a feed of anomalies.
  const anomalies = analyticsData?.anomalies || [];

  return (
    <DashboardLayout searchPlaceholder="Search logistics metrics...">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-header">Analytics Performance</h1>
            <p className="page-subtitle">Real-time logistics intelligence and fleet efficiency metrics.</p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <label htmlFor="analytics-range" className="sr-only">Date range</label>
              <select
                id="analytics-range"
                value={rangeDays}
                onChange={(e) => setRangeDays(Number(e.target.value))}
                className="bg-transparent text-sm font-medium text-foreground outline-none cursor-pointer"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={365}>Last 12 months</option>
              </select>
            </div>
            <button 
              onClick={() => setIsDownloadOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Download className="h-4 w-4" /> Export Report
            </button>
          </div>
        </div>

        {/* Stats */}
        <StaggerList className="grid grid-cols-4 gap-4">
          <StaggerItem><StatCard label="Total Orders" value={(summary.totalOrders ?? 0).toLocaleString()} badge={rangeLabel} badgeColor="muted" /></StaggerItem>
          <StaggerItem><StatCard label="Net Revenue" value={`₹${(summary.netRevenue ?? 0).toLocaleString()}`} badge={`${summary.completedOrders ?? 0} completed`} badgeColor="success" /></StaggerItem>
          <StaggerItem><StatCard label="Avg. Delivery" value={summary.avgDeliveryMinutes ? `${summary.avgDeliveryMinutes}m` : "—"} badge={rangeLabel} badgeColor="muted" /></StaggerItem>
          <StaggerItem><StatCard label="Active Drivers" value={(summary.activeDrivers ?? 0).toLocaleString()} badge="Online now" badgeColor="success" /></StaggerItem>
        </StaggerList>

        {/* Charts */}
        <div className="grid grid-cols-3 gap-4">
          {/* Orders Velocity. Spans the full row now that Revenue Stream (see
              below) is gone rather than left as an empty card. */}
          <FadeIn className="col-span-3 section-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Orders Velocity</h3>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success" />
                <span className="text-xs text-muted-foreground">{rangeLabel}</span>
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
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(215,15%,50%)' }} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid hsl(214,20%,90%)', fontSize: 12 }}
                    formatter={(value: number) => [`${value.toLocaleString()} Orders`, '']}
                  />
                  <Area type="monotone" dataKey="orders" stroke="hsl(185, 80%, 28%)" strokeWidth={2.5} fill="url(#colorOrders)" dot={{ r: 4, fill: 'hsl(185, 80%, 28%)', strokeWidth: 2, stroke: '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </FadeIn>

          {/*
            Revenue Stream card removed. It was a W1-W4 toggle that swapped its
            own highlighted state and toasted "Revenue stream updated for
            week: W3" while nothing else — least of all the "Monthly Growth"
            figure below it — actually changed: the same "+12.4%" showed for
            every week, always green, never computed from anything.
            /admin/analytics doesn't return revenue broken out by week (only
            day-by-day order counts, already used by Orders Velocity above),
            so there's nothing real for this control to switch between yet.
            Removed outright rather than left as an empty shell — the same
            call already made elsewhere on this page for Peak Demand Hours
            and the Analytics map, both fake in the same way.
          */}
        </div>

        <DownloadReportDialog
          open={isDownloadOpen}
          onOpenChange={setIsDownloadOpen}
          title="Logistics Analytics Performance Report"
          data={[
            { "Metric": "Range", "Value": rangeLabel },
            { "Metric": "Total Orders", "Value": String(summary.totalOrders ?? 0) },
            { "Metric": "Net Revenue", "Value": `INR ${(summary.netRevenue ?? 0).toLocaleString()}` },
            { "Metric": "Avg. Delivery Time", "Value": summary.avgDeliveryMinutes ? `${summary.avgDeliveryMinutes}m` : "n/a" },
            { "Metric": "Active Drivers", "Value": String(summary.activeDrivers ?? 0) },
            ...anomalies.map((a: any) => ({
              "Metric": `Anomaly: ${a.id} (${a.driver})`,
              "Value": `${a.status} - ${a.activity}`
            }))
          ]}
        />

        {/* Anomaly Detection */}
        <div className="section-card">
          <div className="flex items-center justify-between p-6 pb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Real-time Anomaly Detection</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Active orders that have not progressed for over 40 minutes.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse-dot" />
              <span className="text-xs font-medium text-primary">Live Feed</span>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                <th className="table-header-text text-left px-6 py-3">Shipment ID</th>
                <th className="table-header-text text-left px-6 py-3">Route Status</th>
                <th className="table-header-text text-left px-6 py-3">Driver</th>
                <th className="table-header-text text-left px-6 py-3">Est. Value</th>
                <th className="table-header-text text-left px-6 py-3">Activity</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout" initial={false}>
              {!isLoading && anomalies.length === 0 && (
                <tr className="border-t border-border">
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-muted-foreground">
                    No stalled orders right now.
                  </td>
                </tr>
              )}
              {anomalies.map((a: any) => (
                <motion.tr
                  key={a.id}
                  layout
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{a.id}</td>
                  <td className="px-6 py-4"><StatusBadge status={a.status} variant={a.statusVariant} /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-muted" />
                      <span className="text-sm text-foreground">{a.driver}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{a.value}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{a.activity}</td>
                </motion.tr>
              ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
