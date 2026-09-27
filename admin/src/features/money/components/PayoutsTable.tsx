import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { formatDate, payoutStatusStyles, rupees, type PayoutRow } from "../moneyTypes";
import { CopyValue, StatusPill } from "./MoneyBits";

interface PayoutsTableProps {
  rows: PayoutRow[];
  isLoading: boolean;
  emptyLabel: string;
  onMarkPaid: (row: PayoutRow) => void;
  onReject: (row: PayoutRow) => void;
}

const columns = (onMarkPaid: PayoutsTableProps["onMarkPaid"], onReject: PayoutsTableProps["onReject"]): DataTableColumn<PayoutRow>[] => [
  {
    key: "requested",
    header: "Requested",
    cell: (p) => <p className="text-sm text-foreground whitespace-nowrap">{formatDate(p.requestedAt)}</p>,
  },
  {
    key: "payee",
    header: "Payee",
    cell: (p) => (
      <>
        <p className="text-sm font-medium text-foreground">{p.name}</p>
        <p className="text-xs text-muted-foreground">
          {p.kind === "driver" ? "Driver" : "Vendor"} · {p.phone || "no phone"}
        </p>
      </>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    cell: (p) => <p className="text-sm font-semibold text-foreground tabular-nums">{rupees(p.amount)}</p>,
  },
  {
    key: "bank",
    header: "Pay to",
    cell: (p) => (
      <div className="space-y-0.5">
        <CopyValue label="Name" value={p.bank.holderName} />
        <CopyValue label="A/c" value={p.bank.accountNumber} />
        <CopyValue label="IFSC" value={p.bank.ifsc} />
        {!p.bank.verified && <p className="text-[11px] text-amber-700">Bank details not verified. Confirm before paying.</p>}
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (p) => (
      <div className="space-y-1">
        <StatusPill {...payoutStatusStyles[p.status]} />
        {p.status === "processed" && (
          <p className="text-xs text-muted-foreground">
            {p.reference ? `Ref ${p.reference}` : "Paid"}
            {p.handledBy ? ` · by ${p.handledBy}` : ""} · {formatDate(p.processedAt)}
          </p>
        )}
        {p.status === "failed" && p.failureReason && <p className="text-xs text-muted-foreground max-w-[220px]">{p.failureReason}</p>}
      </div>
    ),
  },
  {
    key: "action",
    header: "Action",
    cell: (p) =>
      p.status === "pending" ? (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-lg" onClick={() => onReject(p)}>Reject</Button>
          <Button size="sm" className="rounded-lg" onClick={() => onMarkPaid(p)}>Mark paid</Button>
        </div>
      ) : p.status === "processing" ? (
        <span className="text-xs text-muted-foreground">Updates automatically</span>
      ) : (
        <span className="text-xs text-muted-foreground">No action needed</span>
      ),
  },
];

/** Driver and vendor cash-out requests on Payouts.tsx. */
export function PayoutsTable({ rows, isLoading, emptyLabel, onMarkPaid, onReject }: PayoutsTableProps) {
  return (
    <div className="section-card">
      <DataTable
        columns={columns(onMarkPaid, onReject)}
        data={rows}
        rowKey={(p) => `${p.kind}-${p.id}`}
        isLoading={isLoading}
        loadingLabel="Loading payout requests..."
        emptyLabel={emptyLabel}
      />
    </div>
  );
}
