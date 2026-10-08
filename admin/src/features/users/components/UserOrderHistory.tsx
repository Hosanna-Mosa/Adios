import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { orderServiceLabel } from "@/components/shared/orderService";
import type { UserOrderItem } from "../userDetailTypes";

const HEADER_CLASS = "table-header-text text-left px-4 py-2.5";
const CELL_CLASS = "px-4 py-3";

interface UserOrderHistoryProps {
  orders: UserOrderItem[];
  onViewChat: (orderId: string) => void;
}

/** The "Order & Execution History" table on UserDetail. */
export function UserOrderHistory({ orders, onViewChat }: UserOrderHistoryProps) {
  const { t } = useTranslation();
  const columns: DataTableColumn<UserOrderItem>[] = [
    {
      key: "id",
      header: t("dashboard.orderId"),
      headerClassName: HEADER_CLASS,
      cellClassName: `${CELL_CLASS} font-semibold text-primary`,
      cell: (order) => (
        <Link to={`/live-orders/${order._id}`} className="hover:underline">
          {order._id}
        </Link>
      ),
    },
    {
      key: "serviceType",
      header: t("users.serviceType"),
      headerClassName: HEADER_CLASS,
      cellClassName: `${CELL_CLASS} font-medium whitespace-nowrap`,
      cell: (order) => orderServiceLabel(order, t),
    },
    {
      key: "fare",
      header: t("users.fare"),
      headerClassName: HEADER_CLASS,
      cellClassName: `${CELL_CLASS} font-semibold`,
      cell: (order) => `₹${order.totalPrice}`,
    },
    {
      key: "status",
      header: t("users.status"),
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
      header: t("users.date"),
      headerClassName: HEADER_CLASS,
      cellClassName: `${CELL_CLASS} text-muted-foreground`,
      cell: (order) => new Date(order.createdAt).toLocaleDateString(),
    },
    {
      key: "action",
      header: t("dashboard.action"),
      headerClassName: HEADER_CLASS,
      cellClassName: CELL_CLASS,
      cell: (order) => (
        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 rounded-lg" onClick={() => onViewChat(order._id)}>
          <MessageSquare className="h-3 w-3" /> {t("users.viewChat")}
        </Button>
      ),
    },
  ];

  return (
    <div className="bg-card border border-border p-6 rounded-3xl space-y-4 shadow-sm">
      <h3 className="text-lg font-bold text-foreground">{t("users.orderAndExecutionHistory")}</h3>
      <div className="overflow-x-auto">
        <DataTable
          columns={columns}
          data={orders}
          rowKey={(order) => order._id}
          emptyLabel={t("users.noOrdersRecordedForCustomer")}
          headerRowClassName="bg-muted/50 text-xs"
          tbodyClassName="text-xs"
          stateCellClassName="px-4 py-8 text-center text-muted-foreground"
        />
      </div>
    </div>
  );
}
