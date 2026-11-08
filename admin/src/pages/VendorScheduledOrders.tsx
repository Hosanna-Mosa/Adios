import { useTranslation } from "react-i18next";
import { VendorLayout } from "@/components/layout/VendorLayout";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { useVendorScheduledOrders } from "@/features/vendors/hooks/useVendorScheduledOrders";
import { VendorScheduledOrdersStats } from "@/features/vendors/components/VendorScheduledOrdersStats";
import { VendorScheduledOrderList } from "@/features/vendors/components/VendorScheduledOrderList";

export default function VendorScheduledOrders() {
  const { t } = useTranslation();
  const { requests, isLoading, isFetching, refetch, respondingId, isResponding, handleRespond, pendingCount, acceptedCount } = useVendorScheduledOrders();

  return (
    <VendorLayout searchPlaceholder={t("vendorScheduledOrders.searchScheduledOrders")}>
      <div className="space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("vendorScheduledOrders.scheduledOrders")}</h1>
            <p className="text-muted-foreground">
              {t("vendorScheduledOrders.reviewAndManageDesc")}
            </p>
          </div>
          <RefreshButton onRefresh={() => refetch()} isRefreshing={isFetching} label={t("vendorDashboard.refresh")} />
        </div>

        <VendorScheduledOrdersStats total={requests.length} pending={pendingCount} accepted={acceptedCount} />

        <VendorScheduledOrderList
          isLoading={isLoading}
          requests={requests}
          respondingId={respondingId}
          isResponding={isResponding}
          onRespond={handleRespond}
        />
      </div>
    </VendorLayout>
  );
}
