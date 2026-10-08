import { Link } from "react-router-dom";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ServiceBadge } from "@/components/shared/ServiceBadge";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Star, GitBranch, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { LiveOrder } from "../liveOrdersTypes";
import { adminOrderStatusLabel } from "../adminOrderStatus";

interface LiveOrdersTableProps {
  isLoading: boolean;
  filteredOrders: LiveOrder[];
  totalCount: number;
}

const getColumns = (t: (key: string, opts?: Record<string, unknown>) => string): DataTableColumn<LiveOrder>[] => [
  {
    key: "orderId",
    header: t("dashboard.orderId"),
    cellClassName: "px-6 py-4 text-sm font-medium text-primary",
    cell: (o) => (
      <Link to={`/live-orders/${o._id}`} className="hover:underline">
        {o._id.startsWith("ORD-") ? o._id : `#${o._id.substring(o._id.length - 6).toUpperCase()}`}
      </Link>
    ),
  },
  {
    key: "user",
    header: t("orders.user"),
    cell: (o) => (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
          {o.user?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "U"}
        </div>
        <span className="text-sm text-foreground">{o.user?.name || t("orders.unknownUser")}</span>
      </div>
    ),
  },
  {
    key: "service",
    header: t("service.column"),
    cell: (o) => <ServiceBadge order={o} />,
  },
  {
    key: "stops",
    header: t("orders.stops"),
    cell: (o) => (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {o.stops?.length === 1 ? <MapPin className="h-3.5 w-3.5" /> : <GitBranch className="h-3.5 w-3.5" />}
        {t("orders.nStops", { count: o.stops?.length || 0, defaultValue: "{{count}} stops" })}
      </div>
    ),
  },
  {
    key: "status",
    header: t("users.status"),
    cell: (o) => <StatusBadge status={adminOrderStatusLabel(o.status, t)} variant={o.status === "DELIVERED" ? "delivered" : o.status === "PICKED_UP" ? "transit" : "assigned"} />,
  },
  {
    key: "driver",
    header: t("orders.assignedDriver"),
    cell: (o) => (
      <div className="flex items-center gap-2">
        <span className={`text-sm ${!o.driver ? "italic text-muted-foreground" : "text-foreground"}`}>
          {o.driver ? o.driver.user?.name || t("orders.driver") : t("orders.awaitingAssignmentEllipsis")}
        </span>
        {/* The driver's real rating, when they have one (this was a hardcoded 4.8). */}
        {typeof o.driver?.rating === "number" && o.driver.rating > 0 && (
          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-warning text-warning" /> {o.driver.rating.toFixed(1)}
          </span>
        )}
      </div>
    ),
  },
  {
    key: "eta",
    header: t("orders.eta"),
    cell: (o) => (
      <div>
        <p className="text-sm font-medium text-foreground">{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        <p className={`text-xs text-muted-foreground`}>{t("orders.created")}</p>
      </div>
    ),
  },
];

/** The "Ongoing Operations" table (rows + result count) on LiveOrders.tsx. */
export function LiveOrdersTable({ isLoading, filteredOrders, totalCount }: LiveOrdersTableProps) {
  const { t } = useTranslation();
  const columns = getColumns(t);
  return (
    <div className="section-card">
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-success animate-pulse-dot" />
          <h3 className="text-lg font-semibold text-foreground">{t("orders.ongoingOperations")}</h3>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredOrders}
        rowKey={(o) => o._id}
        isLoading={isLoading}
        loadingLabel={t("orders.loadingOrders")}
        emptyLabel={t("orders.noOrdersFoundMatchingFilter")}
      />

      {/* Every matching order is listed above, so there is nothing to page
          through: the Previous/Next buttons that only toasted "No previous
          pages" / "No next pages" were removed. */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border">
        <p className="text-sm text-muted-foreground">{t("orders.showingNResults", { count: totalCount, defaultValue: "Showing {{count}} results" })}</p>
      </div>
    </div>
  );
}
