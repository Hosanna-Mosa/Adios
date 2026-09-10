import { motion, AnimatePresence } from "framer-motion";
import { fadeIn } from "@/components/motion/variants";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/Pagination";
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

      <table className="w-full">
        <thead>
          <tr className="border-t border-border">
            <th className="table-header-text text-left px-6 py-3">Order</th>
            <th className="table-header-text text-left px-6 py-3">Customer</th>
            <th className="table-header-text text-left px-6 py-3">Restaurant</th>
            <th className="table-header-text text-left px-6 py-3">Requested Slot</th>
            <th className="table-header-text text-left px-6 py-3">Status</th>
            <th className="table-header-text text-left px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">Loading scheduled orders...</td>
            </tr>
          ) : !hasAnyOrders ? (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                No scheduled orders yet. They appear here as soon as a customer books a later slot at checkout.
              </td>
            </tr>
          ) : filteredOrders.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">No scheduled orders match the filter.</td>
            </tr>
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
            {paginatedOrders.map((order) => {
              const scheduleStatus = scheduleStatusOf(order);
              const status = statusStyles[scheduleStatus];
              const StatusIcon = status.icon;
              const isDecidingThisOrder = isDeciding && decidingId === order._id;

              return (
                <motion.tr
                  key={order._id}
                  layout
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-foreground">{orderLabel(order._id)}</p>
                    <p className="text-xs text-muted-foreground">
                      ₹{order.totalPrice || 0} · {order.items?.length || 0} item{(order.items?.length || 0) === 1 ? "" : "s"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-foreground">{order.user?.name || "Customer"}</p>
                    <p className="text-xs text-muted-foreground">{order.user?.phone || "N/A"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-foreground">{order.vendor?.name || "—"}</p>
                    <p className="text-xs text-muted-foreground max-w-[200px] truncate">{order.vendor?.address || ""}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-foreground">{formatSlot(order.scheduledFor)}</p>
                    <p className="text-xs text-muted-foreground">
                      Booked {formatDate(order.createdAt, "MMM d, hh:mm a")}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase border inline-flex items-center gap-1 ${status.className}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {status.label}
                    </span>
                    {scheduleStatus === "rejected" && order.scheduleRejectionReason && (
                      <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">{order.scheduleRejectionReason}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {scheduleStatus === "pending" ? (
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
                    )}
                  </td>
                </motion.tr>
              );
            })}
            </AnimatePresence>
          )}
        </tbody>
      </table>

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
