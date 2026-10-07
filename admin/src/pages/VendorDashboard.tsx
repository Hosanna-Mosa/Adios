import { useTranslation } from "react-i18next";
import { VendorLayout } from "@/components/layout/VendorLayout";
import { useVendorDashboard } from "@/features/vendors/hooks/useVendorDashboard";
import { VendorStatsRow } from "@/features/vendors/components/VendorStatsRow";
import { VendorOrderList } from "@/features/vendors/components/VendorOrderList";
import { VendorMenuPerformancePanel } from "@/features/vendors/components/VendorMenuPerformancePanel";
import { VendorOrderDetailDialog } from "@/features/vendors/components/VendorOrderDetailDialog";
import { VendorScheduledRequestDialog } from "@/features/vendors/components/VendorScheduledRequestDialog";

export default function VendorDashboard() {
  const { t } = useTranslation();
  const {
    vendorData,
    isMeatVendor,
    orders,
    ordersLoading,
    menuCount,
    totalRevenue,
    rating,
    selectedOrder,
    setSelectedOrder,
    isModalOpen,
    setIsModalOpen,
    scheduledRequest,
    setScheduledRequest,
    isScheduleModalOpen,
    setIsScheduleModalOpen,
    respondToScheduledDelivery,
    isResponding,
    markAsReady,
    acceptOrder,
    rejectOrder,
    isAccepting,
    isUpdatingStatus,
    getOrderItems,
    getStatusDisplay,
  } = useVendorDashboard();

  return (
    <VendorLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("vendorDashboard.welcomeName", { name: vendorData.name, defaultValue: "Welcome, {{name}}" })}</h1>
          <p className="text-muted-foreground">{isMeatVendor ? t("vendorDashboard.meatCenterTodaySummary") : t("vendorDashboard.restaurantTodaySummary")}</p>
        </div>

        <VendorStatsRow ordersCount={orders?.length || 0} menuCount={menuCount || 0} isMeatVendor={isMeatVendor} totalRevenue={totalRevenue} rating={rating} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <VendorOrderList
            orders={orders}
            isLoading={ordersLoading}
            getStatusDisplay={getStatusDisplay}
            onOrderClick={(order) => {
              setSelectedOrder(order);
              setIsModalOpen(true);
            }}
          />

          <VendorMenuPerformancePanel isMeatVendor={isMeatVendor} />
        </div>
      </div>

      <VendorOrderDetailDialog
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        order={selectedOrder}
        getStatusDisplay={getStatusDisplay}
        getOrderItems={getOrderItems}
        onMarkAsReady={markAsReady}
        onAccept={acceptOrder}
        onReject={rejectOrder}
        isAccepting={isAccepting}
        isUpdatingStatus={isUpdatingStatus}
      />

      <VendorScheduledRequestDialog
        isOpen={isScheduleModalOpen}
        onOpenChange={(open) => {
          setIsScheduleModalOpen(open);
          if (!open) setScheduledRequest(null);
        }}
        request={scheduledRequest}
        onRespond={respondToScheduledDelivery}
        isResponding={isResponding}
      />
    </VendorLayout>
  );
}
