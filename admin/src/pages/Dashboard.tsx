import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { fadeIn } from "@/components/motion/variants";
import { Package, Truck, Users, DollarSign, CheckCircle, AlertTriangle, UserPlus, MoreVertical, Eye, Ban } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const priorityStyles: Record<string, string> = {
  HIGH: "bg-destructive text-destructive-foreground",
  STANDARD: "bg-muted text-muted-foreground",
  EXPRESS: "bg-primary text-primary-foreground",
};

/** "2 mins ago" from a real timestamp — the activity rows used to carry a
 *  hardcoded "Just now" regardless of when the thing actually happened. */
function timeAgo(value?: string | null): string {
  if (!value) return "";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function formatEta(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [timeScale, setTimeScale] = useState<"DAILY" | "WEEKLY">("DAILY");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    // Live board: refetched on an interval and on window focus so it reflects
    // what is happening now rather than whatever was true when the tab opened.
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    queryFn: () => adminFetch<any>("/admin/stats"),
  });

  const barData = stats?.barData || [];
  const weeklyBarData = stats?.weeklyBarData || [];
  // No hardcoded sample rows behind these any more: whatever the API returns is
  // what the dashboard shows, and nothing is what it shows when there is nothing.
  const activityLog = stats?.activityLog || [];
  // Memoised off stats itself: `stats?.manifests || []` builds a fresh array on
  // every render, which would re-run the filter below each time.
  const manifests = useMemo(() => stats?.manifests || [], [stats]);

  const visibleManifests = useMemo(() => {
    if (priorityFilter === "ALL") return manifests;
    return manifests.filter((m: any) => m.priority === priorityFilter);
  }, [manifests, priorityFilter]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "DELIVERY":
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case "USER_REG":
        return <UserPlus className="h-4 w-4 text-muted-foreground" />;
      case "SYSTEM":
      default:
        return <AlertTriangle className="h-4 w-4 text-warning" />;
    }
  };

  const handleCancelManifest = async (m: any) => {
    const orderId = m.orderId || m.id;
    if (!orderId) return;
    try {
      // A real state change against the order, not a toast pretending one happened.
      await adminFetch(`/admin/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      toast.success(`Order ${orderId} cancelled.`);
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    } catch (err: any) {
      toast.error(err?.message || "Could not cancel this order.");
    }
  };

  return (
    <DashboardLayout searchPlaceholder="Search orders, drivers, or routes...">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-header">Operational Overview</h1>
          <p className="page-subtitle">Real-time supply chain performance metrics.</p>
        </div>

        {/* Stat Cards */}
        <StaggerList className="grid grid-cols-4 gap-4">
          <StaggerItem>
            <StatCard icon={<Package className="h-5 w-5" />} label="Total Orders" value={stats?.totalOrders?.toString() || "0"} badge="all time" badgeColor="success" />
          </StaggerItem>
          <StaggerItem>
            <StatCard icon={<Truck className="h-5 w-5" />} label="Active Drivers" value={stats?.activeDrivers?.toString() || "0"} badge="Online" badgeColor="success" />
          </StaggerItem>
          <StaggerItem>
            <StatCard icon={<Users className="h-5 w-5" />} label="Total Users" value={stats?.totalUsers?.toString() || "0"} badge="System" badgeColor="muted" />
          </StaggerItem>
          <StaggerItem>
            <StatCard icon={<DollarSign className="h-5 w-5" />} label="Total Revenue" value={`₹${stats?.totalRevenue?.toLocaleString() || "0"}`} badge="INR" badgeColor="success" />
          </StaggerItem>
        </StaggerList>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Delivery Performance */}
          <FadeIn className="col-span-2 section-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Delivery Performance</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{timeScale === "DAILY" ? "Last 24 hours vs Target" : "Last 4 weeks vs Target"}</p>
              </div>
              <div className="flex gap-1 bg-muted rounded-lg p-0.5">
                <button
                  onClick={() => setTimeScale("WEEKLY")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${timeScale === "WEEKLY" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted-foreground/10"}`}
                >
                  WEEKLY
                </button>
                <button
                  onClick={() => setTimeScale("DAILY")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${timeScale === "DAILY" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted-foreground/10"}`}
                >
                  DAILY
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={timeScale === "DAILY" ? barData : weeklyBarData} barGap={4}>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(215, 15%, 50%)' }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid hsl(214,20%,90%)', fontSize: 12 }}
                />
                <Bar dataKey="delivered" fill="hsl(185, 80%, 28%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" fill="hsl(185, 80%, 88%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </FadeIn>

          {/* Live Activity Log */}
          <FadeIn delay={0.05} className="section-card p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-foreground mb-4">Live Activity Log</h3>
            <div className="flex-1 space-y-4">
              {isLoading && (
                <p className="text-sm text-muted-foreground">Loading activity…</p>
              )}
              {!isLoading && activityLog.length === 0 && (
                <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
              )}
              {activityLog.map((item: any, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    {getActivityIcon(item.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {[item.desc, timeAgo(item.time)].filter(Boolean).join(" • ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* Active Manifests */}
        <div className="section-card">
          <div className="flex items-center justify-between p-6 pb-4">
            <h3 className="text-lg font-semibold text-foreground">Active Manifests</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Filter by Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card text-foreground"
              >
                <option value="ALL">All Priorities</option>
                <option value="HIGH">High Priority Only</option>
                <option value="EXPRESS">Express Only</option>
                <option value="STANDARD">Standard Only</option>
              </select>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                <th className="table-header-text text-left px-6 py-3">Order ID</th>
                <th className="table-header-text text-left px-6 py-3">Destination</th>
                <th className="table-header-text text-left px-6 py-3">Driver</th>
                <th className="table-header-text text-left px-6 py-3">Estimated Delivery</th>
                <th className="table-header-text text-left px-6 py-3">Priority</th>
                <th className="table-header-text text-left px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout" initial={false}>
              {visibleManifests.map((m: any) => (
                <motion.tr
                  key={m.orderId || m.id}
                  layout
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-primary">{m.id}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{m.dest || "—"}</td>
                  <td className="px-6 py-4">
                    {m.driver ? (
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          {m.driver.split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        <span className="text-sm text-foreground">{m.driver}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Awaiting assignment</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{formatEta(m.eta)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${priorityStyles[m.priority] || "bg-muted text-muted-foreground"}`}>
                      {m.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:bg-muted rounded transition-colors">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/live-orders/${m.orderId || m.id}`)} className="gap-2 cursor-pointer">
                          <Eye className="h-4 w-4 text-muted-foreground" /> View Manifest
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCancelManifest(m)} className="gap-2 text-destructive focus:text-destructive cursor-pointer">
                          <Ban className="h-4 w-4" /> Cancel Manifest
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
              </AnimatePresence>
            </tbody>
          </table>
          {!isLoading && visibleManifests.length === 0 && (
            <p className="px-6 py-8 text-sm text-muted-foreground text-center">
              {manifests.length === 0 ? "No active manifests right now." : "No manifests match this filter."}
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
