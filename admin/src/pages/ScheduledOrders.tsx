import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useScheduledOrders } from "@/features/orders/hooks/useScheduledOrders";
import { ScheduledOrdersHeader } from "@/features/orders/components/ScheduledOrdersHeader";
import { ScheduledOrdersStatsRow } from "@/features/orders/components/ScheduledOrdersStatsRow";
import { ScheduledOrdersTable } from "@/features/orders/components/ScheduledOrdersTable";
import { RejectScheduledOrderDialog } from "@/features/orders/components/RejectScheduledOrderDialog";

export default function ScheduledOrders() {
  const { t } = useTranslation();
  const {
    orders,
    isLoading,
    statusFilter,
    handleFilterChange,
    currentPage,
    setCurrentPage,
    rejectingOrder,
    setRejectingOrder,
    rejectReason,
    setRejectReason,
    isDeciding,
    decidingId,
    acceptOrder,
    handleReject,
    pendingCount,
    acceptedCount,
    rejectedCount,
    filteredOrders,
    totalPages,
    safePage,
    paginatedOrders,
  } = useScheduledOrders();

  return (
    <DashboardLayout searchPlaceholder={t("orders.searchScheduledOrders")}>
      <div className="space-y-6">
        <ScheduledOrdersHeader statusFilter={statusFilter} onFilterChange={handleFilterChange} />

        <ScheduledOrdersStatsRow pendingCount={pendingCount} acceptedCount={acceptedCount} rejectedCount={rejectedCount} />

        <ScheduledOrdersTable
          isLoading={isLoading}
          hasAnyOrders={orders.length > 0}
          filteredOrders={filteredOrders}
          paginatedOrders={paginatedOrders}
          isDeciding={isDeciding}
          decidingId={decidingId}
          onAccept={acceptOrder}
          onRejectClick={(order) => { setRejectingOrder(order); setRejectReason(""); }}
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <RejectScheduledOrderDialog
        rejectingOrder={rejectingOrder}
        onOpenChange={(open) => { if (!open) { setRejectingOrder(null); setRejectReason(""); } }}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        onSubmit={handleReject}
        isSubmitting={isDeciding}
      />
    </DashboardLayout>
  );
}
