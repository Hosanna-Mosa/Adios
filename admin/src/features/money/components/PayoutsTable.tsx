import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
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

function processedLine(p: PayoutRow, t: TFunction) {
  const date = formatDate(p.processedAt);
  if (p.reference && p.handledBy) return t("money.payoutRefByDate", { reference: p.reference, handledBy: p.handledBy, date });
  if (p.reference) return t("money.payoutRefDate", { reference: p.reference, date });
  if (p.handledBy) return t("money.payoutPaidByDate", { handledBy: p.handledBy, date });
  return t("money.payoutPaidDate", { date });
}

const columns = (onMarkPaid: PayoutsTableProps["onMarkPaid"], onReject: PayoutsTableProps["onReject"], t: TFunction): DataTableColumn<PayoutRow>[] => [
  {
    key: "requested",
    header: t("money.columnRequested"),
    cell: (p) => <p className="text-sm text-foreground whitespace-nowrap">{formatDate(p.requestedAt)}</p>,
  },
  {
    key: "payee",
    header: t("money.columnPayee"),
    cell: (p) => (
      <>
        <p className="text-sm font-medium text-foreground">{p.name}</p>
        <p className="text-xs text-muted-foreground">
          {p.kind === "driver" ? t("money.kindDriver") : t("money.kindVendor")} · {p.phone || t("money.noPhone")}
        </p>
      </>
    ),
  },
  {
    key: "amount",
    header: t("money.columnAmount"),
    cell: (p) => <p className="text-sm font-semibold text-foreground tabular-nums">{rupees(p.amount)}</p>,
  },
  {
    key: "bank",
    header: t("money.columnPayTo"),
    cell: (p) => (
      <div className="space-y-0.5">
        <CopyValue label={t("money.copyLabelName")} value={p.bank.holderName} />
        <CopyValue label={t("money.copyLabelAccount")} value={p.bank.accountNumber} />
        <CopyValue label={t("money.copyLabelIfsc")} value={p.bank.ifsc} />
        {!p.bank.verified && <p className="text-[11px] text-amber-700">{t("money.bankNotVerified")}</p>}
      </div>
    ),
  },
  {
    key: "status",
    header: t("money.columnStatus"),
    cell: (p) => {
      const style = payoutStatusStyles[p.status];
      return (
        <div className="space-y-1">
          <StatusPill label={t(style.labelKey)} className={style.className} icon={style.icon} />
          {p.status === "processed" && (
            <p className="text-xs text-muted-foreground">{processedLine(p, t)}</p>
          )}
          {p.status === "failed" && p.failureReason && <p className="text-xs text-muted-foreground max-w-[220px]">{p.failureReason}</p>}
        </div>
      );
    },
  },
  {
    key: "action",
    header: t("money.columnAction"),
    cell: (p) =>
      p.status === "pending" ? (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-lg" onClick={() => onReject(p)}>{t("money.rejectBtn")}</Button>
          <Button size="sm" className="rounded-lg" onClick={() => onMarkPaid(p)}>{t("money.submitMarkPaid")}</Button>
        </div>
      ) : p.status === "processing" ? (
        <span className="text-xs text-muted-foreground">{t("money.statUpdatesAutomatically")}</span>
      ) : (
        <span className="text-xs text-muted-foreground">{t("money.noActionNeeded")}</span>
      ),
  },
];

/** Driver and vendor cash-out requests on Payouts.tsx. */
export function PayoutsTable({ rows, isLoading, emptyLabel, onMarkPaid, onReject }: PayoutsTableProps) {
  const { t } = useTranslation();
  return (
    <div className="section-card">
      <DataTable
        columns={columns(onMarkPaid, onReject, t)}
        data={rows}
        rowKey={(p) => `${p.kind}-${p.id}`}
        isLoading={isLoading}
        loadingLabel={t("money.loadingPayouts")}
        emptyLabel={emptyLabel}
      />
    </div>
  );
}
