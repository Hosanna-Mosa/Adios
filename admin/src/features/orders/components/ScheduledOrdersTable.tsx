import { CalendarClock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/Pagination";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { getStatusStyle, scheduleStatusOf, orderLabel, formatDate, formatSlot, type ScheduledOrder } from "../scheduledOrdersTypes";

interface ScheduledOrdersTableProps {
  isLoading: boolean;
  hasAnyOrders: boolean;
  filteredOrders: ScheduledOrder[];
  paginatedOrders: ScheduledOrder[];
  isDeciding: boolean;
  decidingId: string | undefined;
  onAccept: (id: string) => void;
  onRejectClick: (order: ScheduledOrder) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function buildColumns(
  isDeciding: boolean,
  decidingId: string | undefined,
  onAccept: (id: string) => void,
  onRejectClick: (order: ScheduledOrder) => void,
  t: (key: string, opts?: Record<string, unknown>) => string
): DataTableColumn<ScheduledOrder>[] {
  return [
    {
      key: "order",
      header: t("orders.order"),
      cell: (order) => (
        <>
          <p className="text-sm font-medium text-foreground">{orderLabel(order._id)}</p>
          <p className="text-xs text-muted-foreground">
            ₹{order.totalPrice || 0} · {t("orders.nItems", { count: order.items?.length || 0, defaultValue: "{{count}} items" })}
          </p>
        </>
      ),
    },
    {
      key: "customer",
      header: t("orders.customer"),
      cell: (order) => (
        <>
          <p className="text-sm text-foreground">{order.user?.name || t("orders.customer")}</p>
          <p className="text-xs text-muted-foreground">{order.user?.phone || t("orders.notAvailableShort")}</p>
        </>
      ),
    },
    {
      key: "restaurant",
      header: t("orders.restaurant"),
      cell: (order) => (
        <>
          <p className="text-sm text-foreground">{order.vendor?.name || "—"}</p>
          <p className="text-xs text-muted-foreground max-w-[200px] truncate">{order.vendor?.address || ""}</p>
        </>
      ),
    },
    {
      key: "slot",
      header: t("orders.requestedSlot"),
      cell: (order) => (
        <>
          <p className="text-sm font-medium text-foreground">{formatSlot(order.scheduledFor)}</p>
          <p className="text-xs text-muted-foreground">
            {t("orders.bookedOn", { date: formatDate(order.createdAt, "MMM d, hh:mm a"), defaultValue: "Booked {{date}}" })}
          </p>
        </>
      ),
    },
    {
      key: "status",
      header: t("users.status"),
      cell: (order) => {
        const scheduleStatus = scheduleStatusOf(order);
        const status = getStatusStyle(scheduleStatus, t);
        const StatusIcon = status.icon;
        return (
          <>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase border inline-flex items-center gap-1 ${status.className}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {status.label}
            </span>
            {scheduleStatus === "rejected" && order.scheduleRejectionReason && (
              <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">{order.scheduleRejectionReason}</p>
            )}
          </>
        );
      },
    },
    {
      key: "action",
      header: t("orders.action"),
      cell: (order) => {
        const scheduleStatus = scheduleStatusOf(order);
        const isDecidingThisOrder = isDeciding && decidingId === order._id;
        return scheduleStatus === "pending" ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={isDecidingThisOrder}
              onClick={() => onRejectClick(order)}
            >
              {t("orders.reject")}
            </Button>
            <Button
              size="sm"
              className="rounded-lg"
              disabled={isDecidingThisOrder}
              onClick={() => onAccept(order._id)}
            >
              {isDecidingThisOrder ? t("orders.savingEllipsis") : t("orders.accept")}
            </Button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">{t("orders.noActionNeeded")}</span>
        );
      },
    },
  ];
}

/** The "Booked Slots" table (rows + pagination) on ScheduledOrders.tsx. */
export function ScheduledOrdersTable({
  isLoading,
  hasAnyOrders,
  filteredOrders,
  paginatedOrders,
  isDeciding,
  decidingId,
  onAccept,
  onRejectClick,
  currentPage,
  totalPages,
  onPageChange,
}: ScheduledOrdersTableProps) {
  const { t } = useTranslation();
  return (
    <div className="section-card">
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">{t("orders.bookedSlots")}</h3>
        </div>
      </div>

      <DataTable
        columns={buildColumns(isDeciding, decidingId, onAccept, onRejectClick, t)}
        data={paginatedOrders}
        rowKey={(order) => order._id}
        isLoading={isLoading}
        loadingLabel={t("orders.loadingScheduledOrders")}
        emptyLabel={
          hasAnyOrders
            ? t("orders.noScheduledOrdersMatchFilter")
            : t("orders.noScheduledOrdersYetDesc")
        }
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemLabel={t("orders.scheduledOrdersLower")}
        shownCount={paginatedOrders.length}
        totalCount={filteredOrders.length}
      />
    </div>
  );
}
