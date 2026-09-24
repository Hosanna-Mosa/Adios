import { useTranslation } from "react-i18next";
import { VendorLayout } from "@/components/layout/VendorLayout";
import { useVendorScheduledOrders } from "@/features/vendors/hooks/useVendorScheduledOrders";
import { VendorScheduledOrdersStats } from "@/features/vendors/components/VendorScheduledOrdersStats";
import { VendorScheduledOrderList } from "@/features/vendors/components/VendorScheduledOrderList";

export default function VendorScheduledOrders() {
  const { t } = useTranslation();
  const { requests, isLoading, respondingId, isResponding, handleRespond, pendingCount, acceptedCount } = useVendorScheduledOrders();

  return (
    <VendorLayout searchPlaceholder={t("vendorScheduledOrders.searchScheduledOrders")}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("vendorScheduledOrders.scheduledOrders")}</h1>
          <p className="text-muted-foreground">
            {t("vendorScheduledOrders.reviewAndManageDesc")}
          </p>
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
