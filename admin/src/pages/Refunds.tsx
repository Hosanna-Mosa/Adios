import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { useRefunds, type RefundFilter } from "@/features/money/hooks/useRefunds";
import { RefundsTable } from "@/features/money/components/RefundsTable";
import { FilterTabs } from "@/features/money/components/MoneyBits";
import { ReferenceDialog } from "@/features/money/components/ReferenceDialog";
import { orderLabel, rupees } from "@/features/money/moneyTypes";

const EMPTY: Record<RefundFilter, string> = {
  attention: "Nothing needs attention. Refunds for cancelled online orders are going through Razorpay automatically.",
  pending: "No refunds in progress.",
  processed: "No completed refunds yet.",
  ALL: "No refunds yet.",
};

export default function Refunds() {
  const {
    refunds, filtered, isLoading, filter, setFilter, markingManual, setMarkingManual, markRefunded,
    retry, checkStatus, busyOrderId, attentionCount, pendingCount, refundedCount,
  } = useRefunds();

  return (
    <DashboardLayout searchPlaceholder="Search refunds...">
      <div className="space-y-6">
        <div>
          <h1 className="page-header">Refunds</h1>
          <p className="page-subtitle">
            Cancelled online orders are refunded through Razorpay automatically. Refunds that failed, or never started, need you here.
          </p>
        </div>

        <StaggerList className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StaggerItem>
            <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Needs attention" value={attentionCount.toString()} badge="Failed or not started" badgeColor={attentionCount ? "destructive" : "muted"} />
          </StaggerItem>
          <StaggerItem>
            <StatCard icon={<Loader2 className="h-5 w-5" />} label="With Razorpay" value={pendingCount.toString()} badge="Updates automatically" badgeColor="muted" />
          </StaggerItem>
          <StaggerItem>
            <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Refunded" value={refundedCount.toString()} />
          </StaggerItem>
        </StaggerList>

        <FilterTabs<RefundFilter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "attention", label: "Needs attention", count: attentionCount },
            { value: "pending", label: "With Razorpay", count: pendingCount },
            { value: "processed", label: "Refunded", count: refundedCount },
            { value: "ALL", label: "All", count: refunds.length },
          ]}
        />

        <RefundsTable
          rows={filtered}
          isLoading={isLoading}
          emptyLabel={EMPTY[filter]}
          busyOrderId={busyOrderId}
          onRetry={retry}
          onCheckStatus={checkStatus}
          onMarkRefunded={setMarkingManual}
        />
      </div>

      <ReferenceDialog
        open={!!markingManual}
        onOpenChange={(open) => !open && setMarkingManual(null)}
        title="Record a manual refund"
        description="Use this only if you sent the money yourself (bank transfer or UPI). The customer is notified with this reference."
        summary={
          markingManual && (
            <>
              <p className="font-semibold text-foreground">{rupees(markingManual.amount)} to {markingManual.customerName}</p>
              <p className="text-muted-foreground">Order {orderLabel(markingManual.orderId)} · {markingManual.customerPhone || "no phone"}</p>
            </>
          )
        }
        fieldLabel="Bank / UPI reference"
        fieldPlaceholder="e.g. UPI ref 426512345678"
        withNote
        submitLabel="Record refund"
        isSubmitting={markRefunded.isPending}
        onSubmit={(reference, note) => markingManual && markRefunded.mutate({ row: markingManual, reference, note })}
      />
    </DashboardLayout>
  );
}
