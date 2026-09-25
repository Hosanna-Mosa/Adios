import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import type { DriverOrderItem } from "../driverDetailTypes";

const HEADER_CLASS = "table-header-text text-left px-4 py-2.5";
const CELL_CLASS = "px-4 py-3";

interface DriverTripsTableProps {
  orders: DriverOrderItem[];
  onViewChat: (orderId: string) => void;
}

const REFUND_LABELS: Record<string, string> = {
  pending: "refund pending",
  processed: "refunded",
  failed: "refund failed",
};

/** What the backend recorded about the money: online payment/refund, or cash collection. */
function paymentLabel(order: DriverOrderItem) {
  if (order.paymentMethod === "online") {
    const refund = order.refundStatus ? REFUND_LABELS[order.refundStatus] : undefined;
    return refund ? `Online · ${refund}` : order.paymentStatus === "paid" ? "Online · paid" : "Online";
  }
  if (order.paymentMethod === "cash") {
    return order.cashCollected ? `Cash · collected ₹${order.cashCollectedAmount ?? ""}` : "Cash · not collected";
  }
  return "—";
}

/** The "Executed Trips & Deliveries" table on DriverDetail. */
export function DriverTripsTable({ orders, onViewChat }: DriverTripsTableProps) {
  const columns: DataTableColumn<DriverOrderItem>[] = [
    {
      key: "id",
      header: "Trip ID",
      headerClassName: HEADER_CLASS,
      cellClassName: `${CELL_CLASS} font-semibold text-primary`,
      cell: (order) => (
        <Link to={`/live-orders/${order._id}`} className="hover:underline">
          {order._id}
        </Link>
      ),
    },
    {
      key: "category",
      header: "Category",
      headerClassName: HEADER_CLASS,
      cellClassName: `${CELL_CLASS} uppercase font-medium`,
      cell: (order) => order.serviceType,
    },
    {
      key: "earnings",
      header: "Earnings",
      headerClassName: HEADER_CLASS,
      cellClassName: `${CELL_CLASS} font-semibold`,
      cell: (order) => `₹${Math.round(order.totalPrice * 0.8)}`,
    },
    {
      key: "payment",
      header: "Payment",
      headerClassName: HEADER_CLASS,
      cellClassName: `${CELL_CLASS} text-xs`,
      cell: (order) => paymentLabel(order),
    },
    {
      key: "status",
      header: "Status",
      headerClassName: HEADER_CLASS,
      cellClassName: CELL_CLASS,
      cell: (order) => (
        <span
          className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
            order.status === "COMPLETED" || order.status === "DELIVERED" || order.status === "delivered"
              ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
              : order.status === "CANCELLED"
                ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
          }`}
        >
          {order.status}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      headerClassName: HEADER_CLASS,
      cellClassName: `${CELL_CLASS} text-muted-foreground`,
      cell: (order) => new Date(order.createdAt).toLocaleDateString(),
    },
    {
      key: "action",
      header: "Action",
      headerClassName: HEADER_CLASS,
      cellClassName: CELL_CLASS,
      cell: (order) => (
        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 rounded-lg" onClick={() => onViewChat(order._id)}>
          <MessageSquare className="h-3 w-3" /> View Chat
        </Button>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <DataTable
        columns={columns}
        data={orders}
        rowKey={(order) => order._id}
        emptyLabel="No trip logs recorded for this driver account."
        headerRowClassName="bg-muted/50 text-xs"
        tbodyClassName="text-xs"
        stateCellClassName="px-4 py-8 text-center text-muted-foreground"
      />
    </div>
  );
}
