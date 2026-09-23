import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useOrderDetail } from "@/features/orders/hooks/useOrderDetail";
import { OrderDetailHeader } from "@/features/orders/components/OrderDetailHeader";
import { OrderTimeline } from "@/features/orders/components/OrderTimeline";
import { RouteInventoryList } from "@/features/orders/components/RouteInventoryList";
import { OrderRouteMap } from "@/features/orders/components/OrderRouteMap";

export default function OrderDetail() {
  const { t } = useTranslation();
  const {
    order,
    isLoading,
    isLoaded,
    zoom,
    setZoom,
    mapType,
    setMapType,
    timelineSteps,
    mapMarkers,
    mapCenter,
    polylinePath,
    handleContactDriver,
  } = useOrderDetail();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[500px]">
          <p className="text-muted-foreground text-sm">{t("orders.loadingOrderDetailsFromDb")}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-foreground">{t("orders.orderNotFound")}</h2>
          <p className="text-muted-foreground mt-2">{t("orders.orderRecordNotRetrievedDesc")}</p>
          <Link to="/live-orders" className="text-primary mt-4 inline-block hover:underline">
            {t("orders.backToLiveOrders")}
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout searchPlaceholder={t("orders.searchOrdersDrivers")}>
      <div className="grid grid-cols-2 gap-0 min-h-[calc(100vh-3.5rem)] -m-6">
        {/* Left Panel */}
        <div className="p-6 overflow-auto">
          <OrderDetailHeader order={order} onContactDriver={handleContactDriver} />
          <OrderTimeline timelineSteps={timelineSteps} />
          <RouteInventoryList stops={order.stops} />
        </div>

        {/* Right Panel - Map */}
        <OrderRouteMap
          isLoaded={isLoaded}
          mapCenter={mapCenter}
          zoom={zoom}
          setZoom={setZoom}
          mapType={mapType}
          setMapType={setMapType}
          mapMarkers={mapMarkers}
          polylinePath={polylinePath}
          driver={order.driver}
        />
      </div>
    </DashboardLayout>
  );
}
