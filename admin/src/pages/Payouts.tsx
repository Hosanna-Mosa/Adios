import { Hourglass, CheckCircle2, XCircle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { usePayouts, type PayoutFilter } from "@/features/money/hooks/usePayouts";
import { PayoutsTable } from "@/features/money/components/PayoutsTable";
import { FilterTabs } from "@/features/money/components/MoneyBits";
import { ReferenceDialog } from "@/features/money/components/ReferenceDialog";
import { rupees } from "@/features/money/moneyTypes";

const EMPTY: Record<PayoutFilter, string> = {
  pending: "No payout requests waiting. Driver and vendor cash-outs appear here.",
  processed: "No payouts marked paid yet.",
  failed: "No rejected payouts.",
  ALL: "No payout requests yet.",
};

export default function Payouts() {
  const {
    payouts, filtered, isLoading, filter, setFilter, paying, setPaying, rejecting, setRejecting,
    markPaid, reject, toPayCount, toPayTotal, paidCount, rejectedCount,
  } = usePayouts();

  const summary = (row: typeof paying) =>
    row && (
      <>
        <p className="font-semibold text-foreground">{rupees(row.amount)} to {row.name} ({row.kind})</p>
        <p className="text-muted-foreground">A/c {row.bank.accountNumber || "missing"} · IFSC {row.bank.ifsc || "missing"}</p>
      </>
    );

  return (
    <DashboardLayout searchPlaceholder="Search payouts...">
      <div className="space-y-6">
        <div>
          <h1 className="page-header">Payouts</h1>
          <p className="page-subtitle">
            Drivers and vendors request a cash-out; transfer the amount from the bank, then record the UTR here. They're notified automatically.
          </p>
        </div>

        <StaggerList className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StaggerItem>
            <StatCard icon={<Hourglass className="h-5 w-5" />} label="To pay" value={rupees(toPayTotal)} badge={`${toPayCount} request${toPayCount === 1 ? "" : "s"}`} badgeColor={toPayCount ? "destructive" : "muted"} />
          </StaggerItem>
          <StaggerItem>
            <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Paid" value={paidCount.toString()} />
          </StaggerItem>
          <StaggerItem>
            <StatCard icon={<XCircle className="h-5 w-5" />} label="Rejected / failed" value={rejectedCount.toString()} badge="Amount returned to balance" badgeColor="muted" />
          </StaggerItem>
        </StaggerList>

        <FilterTabs<PayoutFilter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "pending", label: "To pay", count: toPayCount },
            { value: "processed", label: "Paid", count: paidCount },
            { value: "failed", label: "Rejected", count: rejectedCount },
            { value: "ALL", label: "All", count: payouts.length },
          ]}
        />

        <PayoutsTable rows={filtered} isLoading={isLoading} emptyLabel={EMPTY[filter]} onMarkPaid={setPaying} onReject={setRejecting} />
      </div>

      <ReferenceDialog
        open={!!paying}
        onOpenChange={(open) => !open && setPaying(null)}
        title="Mark payout as paid"
        description="Only do this after the money has left the bank. The payee is notified with this reference."
        summary={summary(paying)}
        fieldLabel="Bank / UPI reference (UTR)"
        fieldPlaceholder="e.g. HDFCN52026092512345"
        withNote
        submitLabel="Mark paid"
        isSubmitting={markPaid.isPending}
        onSubmit={(reference, note) => paying && markPaid.mutate({ row: paying, reference, note })}
      />

      <ReferenceDialog
        open={!!rejecting}
        onOpenChange={(open) => !open && setRejecting(null)}
        title="Reject payout request"
        description="The amount goes back to their balance and they're told the reason."
        summary={summary(rejecting)}
        fieldLabel="Reason"
        fieldPlaceholder="e.g. Account holder name doesn't match the driver's name"
        submitLabel="Reject request"
        destructive
        isSubmitting={reject.isPending}
        onSubmit={(reason) => rejecting && reject.mutate({ row: rejecting, reason })}
      />
    </DashboardLayout>
  );
}
