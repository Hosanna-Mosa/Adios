import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { formatDate, orderLabel, refundStatusStyles, rupees, type RefundRow } from "../moneyTypes";
import { StatusPill } from "./MoneyBits";

interface RefundsTableProps {
  rows: RefundRow[];
  isLoading: boolean;
  emptyLabel: string;
  busyOrderId: string | null;
  onRetry: (row: RefundRow) => void;
  onCheckStatus: (row: RefundRow) => void;
  onMarkRefunded: (row: RefundRow) => void;
}

function statusDetail(r: RefundRow, t: TFunction) {
  if (r.status === "processed") {
    const date = formatDate(r.completedAt);
    if (r.method === "manual") {
      if (r.reference && r.refundedBy) return t("money.refundPaidManuallyRefBy", { reference: r.reference, refundedBy: r.refundedBy, date });
      if (r.reference) return t("money.refundPaidManuallyRef", { reference: r.reference, date });
      if (r.refundedBy) return t("money.refundPaidManuallyBy", { refundedBy: r.refundedBy, date });
      return t("money.refundPaidManually", { date });
    }
    return t("money.refundViaRazorpay", { date });
  }
  if (r.status === "pending") {
    return r.razorpayRefundId
      ? t("money.refundPendingRazorpayWithId", { razorpayRefundId: r.razorpayRefundId })
      : t("money.refundPendingRazorpay");
  }
  if (r.status === "due") return t("money.refundDue");
  return r.failureReason || t("money.refundFailedFallback");
}

const columns = (props: RefundsTableProps, t: TFunction): DataTableColumn<RefundRow>[] => [
  {
    key: "order",
    header: t("money.columnOrder"),
    cell: (r) => (
      <>
        <Link to={`/live-orders/${r.orderId}`} className="text-sm font-medium text-primary hover:underline">{orderLabel(r.orderId)}</Link>
        <p className="text-xs text-muted-foreground capitalize">{r.serviceType} · {t("money.cancelledOn", { date: formatDate(r.cancelledAt) })}</p>
      </>
    ),
  },
  {
    key: "customer",
    header: t("money.columnCustomer"),
    cell: (r) => (
      <>
        <p className="text-sm text-foreground whitespace-nowrap">{r.customerName}</p>
        <p className="text-xs text-muted-foreground whitespace-nowrap">{r.customerPhone || t("money.noPhone")}</p>
      </>
    ),
  },
  {
    key: "amount",
    header: t("money.columnAmount"),
    cell: (r) => <p className="text-sm font-semibold text-foreground tabular-nums">{rupees(r.amount)}</p>,
  },
  {
    key: "status",
    header: t("money.columnStatus"),
    cell: (r) => {
      const style = refundStatusStyles[r.status];
      return (
        <div className="space-y-1">
          <StatusPill label={t(style.labelKey)} className={style.className} icon={style.icon} />
          <p className="text-xs text-muted-foreground max-w-[260px]">{statusDetail(r, t)}</p>
        </div>
      );
    },
  },
  {
    key: "action",
    header: t("money.columnAction"),
    cell: (r) => {
      const busy = props.busyOrderId === r.orderId;
      if (r.status === "due" || r.status === "failed") {
        return (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="rounded-lg" disabled={busy} onClick={() => props.onMarkRefunded(r)}>
              {t("money.markRefundedBtn")}
            </Button>
            <Button size="sm" className="rounded-lg" disabled={busy} onClick={() => props.onRetry(r)}>
              {busy ? t("money.sendingEllipsis") : t("money.refundViaRazorpayBtn")}
            </Button>
          </div>
        );
      }
      if (r.status === "pending") {
        return (
          <Button variant="outline" size="sm" className="rounded-lg" disabled={busy} onClick={() => props.onCheckStatus(r)}>
            {busy ? t("money.checkingEllipsis") : t("money.checkStatusBtn")}
          </Button>
        );
      }
      return <span className="text-xs text-muted-foreground">{t("money.noActionNeeded")}</span>;
    },
  },
];

/** Refunds of online-paid orders on Refunds.tsx. */
export function RefundsTable(props: RefundsTableProps) {
  const { t } = useTranslation();
  return (
    <div className="section-card">
      <DataTable
        columns={columns(props, t)}
        data={props.rows}
        rowKey={(r) => r.orderId}
        isLoading={props.isLoading}
        loadingLabel={t("money.loadingRefunds")}
        emptyLabel={props.emptyLabel}
      />
    </div>
  );
}
