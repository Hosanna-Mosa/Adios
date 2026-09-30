import { Hourglass, CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { usePayouts, type PayoutFilter } from "@/features/money/hooks/usePayouts";
import { PayoutsTable } from "@/features/money/components/PayoutsTable";
import { FilterTabs } from "@/features/money/components/MoneyBits";
import { ReferenceDialog } from "@/features/money/components/ReferenceDialog";
import { rupees } from "@/features/money/moneyTypes";

export default function Payouts() {
  const { t } = useTranslation();
  const {
    payouts, filtered, isLoading, filter, setFilter, paying, setPaying, rejecting, setRejecting,
    markPaid, reject, toPayCount, toPayTotal, paidCount, rejectedCount,
  } = usePayouts();

  const EMPTY: Record<PayoutFilter, string> = {
    pending: t("money.emptyPayoutsPending"),
    processed: t("money.emptyPayoutsProcessed"),
    failed: t("money.emptyPayoutsFailed"),
    ALL: t("money.emptyPayoutsAll"),
  };

  const summary = (row: typeof paying) =>
    row && (
      <>
        <p className="font-semibold text-foreground">{t("money.payoutToPayee", { amount: rupees(row.amount), name: row.name, kind: row.kind })}</p>
        <p className="text-muted-foreground">{t("money.bankLine", { accountNumber: row.bank.accountNumber || t("money.missing"), ifsc: row.bank.ifsc || t("money.missing") })}</p>
      </>
    );

  return (
    <DashboardLayout searchPlaceholder={t("money.searchPayoutsPlaceholder")}>
      <div className="space-y-6">
        <div>
          <h1 className="page-header">{t("money.pagePayoutsTitle")}</h1>
          <p className="page-subtitle">
            {t("money.pagePayoutsSubtitle")}
          </p>
        </div>

        <StaggerList className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StaggerItem>
            <StatCard icon={<Hourglass className="h-5 w-5" />} label={t("money.statToPayLabel")} value={rupees(toPayTotal)} badge={t("money.statRequestCount", { count: toPayCount })} badgeColor={toPayCount ? "destructive" : "muted"} />
          </StaggerItem>
          <StaggerItem>
            <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label={t("money.statPaid")} value={paidCount.toString()} />
          </StaggerItem>
          <StaggerItem>
            <StatCard icon={<XCircle className="h-5 w-5" />} label={t("money.statRejectedFailed")} value={rejectedCount.toString()} badge={t("money.statAmountReturnedToBalance")} badgeColor="muted" />
          </StaggerItem>
        </StaggerList>

        <FilterTabs<PayoutFilter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "pending", label: t("money.statToPayLabel"), count: toPayCount },
            { value: "processed", label: t("money.statPaid"), count: paidCount },
            { value: "failed", label: t("money.filterRejected"), count: rejectedCount },
            { value: "ALL", label: t("money.filterAll"), count: payouts.length },
          ]}
        />

        <PayoutsTable rows={filtered} isLoading={isLoading} emptyLabel={EMPTY[filter]} onMarkPaid={setPaying} onReject={setRejecting} />
      </div>

      <ReferenceDialog
        open={!!paying}
        onOpenChange={(open) => !open && setPaying(null)}
        title={t("money.dialogMarkPayoutPaidTitle")}
        description={t("money.dialogMarkPayoutPaidDesc")}
        summary={summary(paying)}
        fieldLabel={t("money.fieldBankUpiReferenceUtr")}
        fieldPlaceholder={t("money.fieldBankUpiReferenceUtrPlaceholder")}
        withNote
        submitLabel={t("money.submitMarkPaid")}
        isSubmitting={markPaid.isPending}
        onSubmit={(reference, note) => paying && markPaid.mutate({ row: paying, reference, note })}
      />

      <ReferenceDialog
        open={!!rejecting}
        onOpenChange={(open) => !open && setRejecting(null)}
        title={t("money.dialogRejectPayoutTitle")}
        description={t("money.dialogRejectPayoutDesc")}
        summary={summary(rejecting)}
        fieldLabel={t("money.fieldReason")}
        fieldPlaceholder={t("money.fieldReasonPlaceholder")}
        submitLabel={t("money.submitRejectRequest")}
        destructive
        isSubmitting={reject.isPending}
        onSubmit={(reason) => rejecting && reject.mutate({ row: rejecting, reason })}
      />
    </DashboardLayout>
  );
}
