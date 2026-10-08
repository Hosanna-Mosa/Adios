import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useLiveOrders } from "@/features/orders/hooks/useLiveOrders";
import { LiveOrdersHeader } from "@/features/orders/components/LiveOrdersHeader";
import { LiveOrdersStatsRow } from "@/features/orders/components/LiveOrdersStatsRow";
import { LiveOrdersTable } from "@/features/orders/components/LiveOrdersTable";

export default function LiveOrders() {
  const { t } = useTranslation();
  const {
    orders,
    isLoading,
    statusFilter,
    setStatusFilter,
    serviceFilter,
    setServiceFilter,
    activeOrdersCount,
    filteredOrders,
  } = useLiveOrders();

  return (
    <DashboardLayout searchPlaceholder={t("orders.searchOrdersDrivers")}>
      <div className="space-y-6">
        <LiveOrdersHeader statusFilter={statusFilter} setStatusFilter={setStatusFilter} serviceFilter={serviceFilter} setServiceFilter={setServiceFilter} />

        <LiveOrdersStatsRow orders={orders} activeOrdersCount={activeOrdersCount} />

        <LiveOrdersTable isLoading={isLoading} filteredOrders={filteredOrders} totalCount={filteredOrders.length} />
      </div>
    </DashboardLayout>
  );
}
