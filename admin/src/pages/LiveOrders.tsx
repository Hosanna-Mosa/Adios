import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus } from "lucide-react";
import { useLiveOrders } from "@/features/orders/hooks/useLiveOrders";
import { LiveOrdersHeader } from "@/features/orders/components/LiveOrdersHeader";
import { LiveOrdersStatsRow } from "@/features/orders/components/LiveOrdersStatsRow";
import { LiveOrdersTable } from "@/features/orders/components/LiveOrdersTable";
import { ManualDispatchDialog } from "@/features/orders/components/ManualDispatchDialog";

export default function LiveOrders() {
  const { t } = useTranslation();
  const {
    orders,
    isLoading,
    statusFilter,
    setStatusFilter,
    isManualOpen,
    setIsManualOpen,
    manualOrder,
    setManualOrder,
    activeOrdersCount,
    handleManualSubmit,
    filteredOrders,
  } = useLiveOrders();

  return (
    <DashboardLayout searchPlaceholder={t("orders.searchOrdersDrivers")}>
      <div className="space-y-6">
        <LiveOrdersHeader statusFilter={statusFilter} setStatusFilter={setStatusFilter} onManualOrderClick={() => setIsManualOpen(true)} />

        <LiveOrdersStatsRow orders={orders} activeOrdersCount={activeOrdersCount} />

        <LiveOrdersTable isLoading={isLoading} filteredOrders={filteredOrders} totalCount={orders.length} />

        {/* FAB */}
        <button
          onClick={() => setIsManualOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      <ManualDispatchDialog
        open={isManualOpen}
        onOpenChange={setIsManualOpen}
        manualOrder={manualOrder}
        setManualOrder={setManualOrder}
        onSubmit={handleManualSubmit}
      />
    </DashboardLayout>
  );
}
