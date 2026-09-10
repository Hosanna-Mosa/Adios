import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/Pagination";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { statusStyles, scheduleStatusOf, orderLabel, formatDate, formatSlot, type ScheduledOrder } from "../scheduledOrdersTypes";

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
  onRejectClick: (order: ScheduledOrder) => void
): DataTableColumn<ScheduledOrder>[] {
  return [
    {
      key: "order",
      header: "Order",
      cell: (order) => (
        <>
          <p className="text-sm font-medium text-foreground">{orderLabel(order._id)}</p>
          <p className="text-xs text-muted-foreground">
            ₹{order.totalPrice || 0} · {order.items?.length || 0} item{(order.items?.length || 0) === 1 ? "" : "s"}
          </p>
        </>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      cell: (order) => (
        <>
          <p className="text-sm text-foreground">{order.user?.name || "Customer"}</p>
          <p className="text-xs text-muted-foreground">{order.user?.phone || "N/A"}</p>
        </>
      ),
    },
    {
      key: "restaurant",
      header: "Restaurant",
      cell: (order) => (
        <>
          <p className="text-sm text-foreground">{order.vendor?.name || "—"}</p>
          <p className="text-xs text-muted-foreground max-w-[200px] truncate">{order.vendor?.address || ""}</p>
        </>
      ),
    },
    {
      key: "slot",
      header: "Requested Slot",
      cell: (order) => (
        <>
          <p className="text-sm font-medium text-foreground">{formatSlot(order.scheduledFor)}</p>
          <p className="text-xs text-muted-foreground">
            Booked {formatDate(order.createdAt, "MMM d, hh:mm a")}
          </p>
        </>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (order) => {
        const scheduleStatus = scheduleStatusOf(order);
        const status = statusStyles[scheduleStatus];
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
      header: "Action",
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
              Reject
            </Button>
            <Button
              size="sm"
              className="rounded-lg"
              disabled={isDecidingThisOrder}
              onClick={() => onAccept(order._id)}
            >
              {isDecidingThisOrder ? "Saving..." : "Accept"}
            </Button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No action needed</span>
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
  return (
    <div className="section-card">
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Booked Slots</h3>
        </div>
      </div>

      <DataTable
        columns={buildColumns(isDeciding, decidingId, onAccept, onRejectClick)}
        data={paginatedOrders}
        rowKey={(order) => order._id}
        isLoading={isLoading}
        loadingLabel="Loading scheduled orders..."
        emptyLabel={
          hasAnyOrders
            ? "No scheduled orders match the filter."
            : "No scheduled orders yet. They appear here as soon as a customer books a later slot at checkout."
        }
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemLabel="scheduled orders"
        shownCount={paginatedOrders.length}
        totalCount={filteredOrders.length}
      />
    </div>
  );
}
