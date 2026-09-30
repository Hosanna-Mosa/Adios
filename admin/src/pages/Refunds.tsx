import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { useRefunds, type RefundFilter } from "@/features/money/hooks/useRefunds";
import { RefundsTable } from "@/features/money/components/RefundsTable";
import { FilterTabs } from "@/features/money/components/MoneyBits";
import { ReferenceDialog } from "@/features/money/components/ReferenceDialog";
import { orderLabel, rupees } from "@/features/money/moneyTypes";

export default function Refunds() {
  const { t } = useTranslation();
  const {
    refunds, filtered, isLoading, filter, setFilter, markingManual, setMarkingManual, markRefunded,
    retry, checkStatus, busyOrderId, attentionCount, pendingCount, refundedCount,
  } = useRefunds();

  const EMPTY: Record<RefundFilter, string> = {
    attention: t("money.emptyRefundsAttention"),
    pending: t("money.emptyRefundsPending"),
    processed: t("money.emptyRefundsProcessed"),
    ALL: t("money.emptyRefundsAll"),
  };

  return (
    <DashboardLayout searchPlaceholder={t("money.searchRefundsPlaceholder")}>
      <div className="space-y-6">
        <div>
          <h1 className="page-header">{t("money.pageRefundsTitle")}</h1>
          <p className="page-subtitle">
            {t("money.pageRefundsSubtitle")}
          </p>
        </div>

        <StaggerList className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StaggerItem>
            <StatCard icon={<AlertTriangle className="h-5 w-5" />} label={t("money.statNeedsAttention")} value={attentionCount.toString()} badge={t("money.statFailedOrNotStarted")} badgeColor={attentionCount ? "destructive" : "muted"} />
          </StaggerItem>
          <StaggerItem>
            <StatCard icon={<Loader2 className="h-5 w-5" />} label={t("money.statWithRazorpay")} value={pendingCount.toString()} badge={t("money.statUpdatesAutomatically")} badgeColor="muted" />
          </StaggerItem>
          <StaggerItem>
            <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label={t("money.statRefunded")} value={refundedCount.toString()} />
          </StaggerItem>
        </StaggerList>

        <FilterTabs<RefundFilter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "attention", label: t("money.statNeedsAttention"), count: attentionCount },
            { value: "pending", label: t("money.statWithRazorpay"), count: pendingCount },
            { value: "processed", label: t("money.statRefunded"), count: refundedCount },
            { value: "ALL", label: t("money.filterAll"), count: refunds.length },
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
        title={t("money.dialogRecordManualRefundTitle")}
        description={t("money.dialogRecordManualRefundDesc")}
        summary={
          markingManual && (
            <>
              <p className="font-semibold text-foreground">{t("money.orderToCustomer", { amount: rupees(markingManual.amount), customerName: markingManual.customerName })}</p>
              <p className="text-muted-foreground">{t("money.orderLine", { orderId: orderLabel(markingManual.orderId), phone: markingManual.customerPhone || t("money.noPhone") })}</p>
            </>
          )
        }
        fieldLabel={t("money.fieldBankUpiReference")}
        fieldPlaceholder={t("money.fieldBankUpiReferencePlaceholder")}
        withNote
        submitLabel={t("money.submitRecordRefund")}
        isSubmitting={markRefunded.isPending}
        onSubmit={(reference, note) => markingManual && markRefunded.mutate({ row: markingManual, reference, note })}
      />
    </DashboardLayout>
  );
}
