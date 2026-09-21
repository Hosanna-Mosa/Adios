import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePayments } from "@/features/orders/hooks/usePayments";
import { PaymentsStatsRow } from "@/features/orders/components/PaymentsStatsRow";
import { PaymentsTable } from "@/features/orders/components/PaymentsTable";
import { RevenueBreakdownPanel } from "@/features/orders/components/RevenueBreakdownPanel";
import { FluidityInsightPanel } from "@/features/orders/components/FluidityInsightPanel";
import { TransactionDetailsDialog } from "@/features/orders/components/TransactionDetailsDialog";

export default function Payments() {
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
    filteredTxns,
  } = usePayments();

  return (
    <DashboardLayout searchPlaceholder="Search transactions, IDs, or drivers...">
      <div className="space-y-6">
        <div>
          <h1 className="page-header">Payments & Revenue</h1>
          <p className="page-subtitle">Real-time financial reconciliation and delivery logistics performance.</p>
        </div>

        <PaymentsStatsRow totalEarned={totalEarned} />

        <PaymentsTable
          isLoading={isLoading}
          filteredTxns={filteredTxns}
          totalCount={transactions.length}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onViewTxn={handleViewTxn}
        />

        {/* Bottom */}
        <div className="grid grid-cols-2 gap-4">
          <RevenueBreakdownPanel />
          <FluidityInsightPanel />
        </div>
      </div>

      <TransactionDetailsDialog open={isViewOpen} onOpenChange={setIsViewOpen} transaction={selectedTxn} />
    </DashboardLayout>
  );
}
