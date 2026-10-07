import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePayments } from "@/features/orders/hooks/usePayments";
import { PaymentsStatsRow } from "@/features/orders/components/PaymentsStatsRow";
import { PaymentsTable } from "@/features/orders/components/PaymentsTable";
import { TransactionDetailsDialog } from "@/features/orders/components/TransactionDetailsDialog";

export default function Payments() {
  const { t } = useTranslation();
  const {
    transactions,
    isLoading,
    selectedTxn,
    isViewOpen,
    setIsViewOpen,
    statusFilter,
    setStatusFilter,
    handleViewTxn,
    totalEarned,
    driverPayoutsTotal,
    paidDriverPayoutsCount,
    filteredTxns,
    paginatedTxns,
    currentPage,
    setCurrentPage,
    totalPages,
    handleExportCsv,
  } = usePayments();

  return (
    <DashboardLayout searchPlaceholder={t("orders.searchTransactionsIdsDrivers")}>
      <div className="space-y-6">
        <div>
          <h1 className="page-header">{t("orders.paymentsAndRevenue")}</h1>
          <p className="page-subtitle">{t("orders.realTimeFinancialReconciliationDesc")}</p>
        </div>

        <PaymentsStatsRow
          totalEarned={totalEarned}
          transactionCount={transactions.length}
          driverPayoutsTotal={driverPayoutsTotal}
          paidDriverPayoutsCount={paidDriverPayoutsCount}
        />

        <PaymentsTable
          isLoading={isLoading}
          pageTxns={paginatedTxns}
          filteredCount={filteredTxns.length}
          totalCount={transactions.length}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onViewTxn={handleViewTxn}
          onExportCsv={handleExportCsv}
        />

        {/* The "Revenue Breakdown" panel (fixed 65/25/10% split) and the
            "Fluidity Insight" callout (a made-up recommendation) were removed:
            /admin/payments has no service-type split or insight behind them. */}
      </div>

      <TransactionDetailsDialog open={isViewOpen} onOpenChange={setIsViewOpen} transaction={selectedTxn} />
    </DashboardLayout>
  );
}
