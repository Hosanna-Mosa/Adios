import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ServiceBadge } from "@/components/shared/ServiceBadge";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { adminOrderStatusLabel } from "@/components/shared/adminOrderStatus";
import { formatDateTime, orderStatusVariant, rupees, serviceFieldsOf, type SupportOrderRow } from "../../supportOrderTypes";

interface SupportOrdersTableProps {
  orders: SupportOrderRow[];
  isLoading: boolean;
  emptyLabel: string;
}

/** Search results on the support Orders page. A row opens the read-only order page. */
export function SupportOrdersTable({ orders, isLoading, emptyLabel }: SupportOrdersTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const columns: DataTableColumn<SupportOrderRow>[] = [
    {
      key: "id",
      header: t("supportOrders.orderId"),
      cellClassName: "px-6 py-4 text-sm font-medium text-primary",
      cell: (o) => `#${o._id}`,
    },
    {
      key: "customer",
      header: t("supportOrders.customer"),
      cell: (o) => (
        <div className="text-sm">
          <p className="text-foreground">{o.customer?.name || t("supportOrders.unknown")}</p>
          {o.customer?.phone && <p className="text-xs text-muted-foreground">{o.customer.phone}</p>}
        </div>
      ),
    },
    { key: "service", header: t("service.column"), cell: (o) => <ServiceBadge order={serviceFieldsOf(o)} /> },
    {
      key: "party",
      header: t("supportOrders.driverOrOutlet"),
      cell: (o) => (
        <div className="text-sm">
          {o.outletName && <p className="text-foreground">{o.outletName}</p>}
          <p className={o.driverName ? "text-muted-foreground" : "italic text-muted-foreground"}>{o.driverName || t("supportOrders.noneAssigned")}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: t("supportOrders.status"),
      cell: (o) => <StatusBadge status={adminOrderStatusLabel(o.status, t)} variant={orderStatusVariant(o.status)} />,
    },
    {
      key: "total",
      header: t("supportOrders.total"),
      cell: (o) => (
        <div className="text-sm">
          <p className="text-foreground">{rupees(o.total)}</p>
          {o.paymentMethod && <p className="text-xs text-muted-foreground">{t(`supportOrders.paymentMethod.${o.paymentMethod}`)}</p>}
        </div>
      ),
    },
    { key: "created", header: t("supportOrders.placed"), cell: (o) => <span className="text-sm text-muted-foreground">{formatDateTime(o.createdAt)}</span> },
  ];

  return (
    <DataTable
      columns={columns}
      data={orders}
      rowKey={(o) => o._id}
      isLoading={isLoading}
      loadingLabel={t("supportOrders.loading")}
      emptyLabel={emptyLabel}
      onRowClick={(o) => navigate(`/support/orders/${encodeURIComponent(o._id)}`)}
      rowClassName="cursor-pointer hover:bg-muted/30"
    />
  );
}
