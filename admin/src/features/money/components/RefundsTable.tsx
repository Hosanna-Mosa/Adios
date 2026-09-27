import { Link } from "react-router-dom";
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

function statusDetail(r: RefundRow) {
  if (r.status === "processed") {
    const how = r.method === "manual" ? `Paid manually${r.reference ? ` · ref ${r.reference}` : ""}${r.refundedBy ? ` · by ${r.refundedBy}` : ""}` : "Via Razorpay";
    return `${how} · ${formatDate(r.completedAt)}`;
  }
  if (r.status === "pending") return `Razorpay is processing it (usually 5–7 working days)${r.razorpayRefundId ? ` · ${r.razorpayRefundId}` : ""}`;
  if (r.status === "due") return "Cancelled, refund not started";
  return r.failureReason || "Refund failed";
}

const columns = (props: RefundsTableProps): DataTableColumn<RefundRow>[] => [
  {
    key: "order",
    header: "Order",
    cell: (r) => (
      <>
        <Link to={`/live-orders/${r.orderId}`} className="text-sm font-medium text-primary hover:underline">{orderLabel(r.orderId)}</Link>
        <p className="text-xs text-muted-foreground capitalize">{r.serviceType} · cancelled {formatDate(r.cancelledAt)}</p>
      </>
    ),
  },
  {
    key: "customer",
    header: "Customer",
    cell: (r) => (
      <>
        <p className="text-sm text-foreground whitespace-nowrap">{r.customerName}</p>
        <p className="text-xs text-muted-foreground whitespace-nowrap">{r.customerPhone || "no phone"}</p>
      </>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    cell: (r) => <p className="text-sm font-semibold text-foreground tabular-nums">{rupees(r.amount)}</p>,
  },
  {
    key: "status",
    header: "Status",
    cell: (r) => (
      <div className="space-y-1">
        <StatusPill {...refundStatusStyles[r.status]} />
        <p className="text-xs text-muted-foreground max-w-[260px]">{statusDetail(r)}</p>
      </div>
    ),
  },
  {
    key: "action",
    header: "Action",
    cell: (r) => {
      const busy = props.busyOrderId === r.orderId;
      if (r.status === "due" || r.status === "failed") {
        return (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="rounded-lg" disabled={busy} onClick={() => props.onMarkRefunded(r)}>
              Mark refunded
            </Button>
            <Button size="sm" className="rounded-lg" disabled={busy} onClick={() => props.onRetry(r)}>
              {busy ? "Sending..." : "Refund via Razorpay"}
            </Button>
          </div>
        );
      }
      if (r.status === "pending") {
        return (
          <Button variant="outline" size="sm" className="rounded-lg" disabled={busy} onClick={() => props.onCheckStatus(r)}>
            {busy ? "Checking..." : "Check status"}
          </Button>
        );
      }
      return <span className="text-xs text-muted-foreground">No action needed</span>;
    },
  },
];

/** Refunds of online-paid orders on Refunds.tsx. */
export function RefundsTable(props: RefundsTableProps) {
  return (
    <div className="section-card">
      <DataTable
        columns={columns(props)}
        data={props.rows}
        rowKey={(r) => r.orderId}
        isLoading={props.isLoading}
        loadingLabel="Loading refunds..."
        emptyLabel={props.emptyLabel}
      />
    </div>
  );
}
