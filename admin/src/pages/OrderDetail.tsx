import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Link } from "react-router-dom";
import { useOrderDetail } from "@/features/orders/hooks/useOrderDetail";
import { OrderDetailHeader } from "@/features/orders/components/OrderDetailHeader";
import { OrderTimeline } from "@/features/orders/components/OrderTimeline";
import { RouteInventoryList } from "@/features/orders/components/RouteInventoryList";
import { OrderRouteMap } from "@/features/orders/components/OrderRouteMap";

export default function OrderDetail() {
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
          <p className="text-muted-foreground text-sm">Loading order details from database...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-foreground">Order Not Found</h2>
          <p className="text-muted-foreground mt-2">The specified order record could not be retrieved from the database.</p>
          <Link to="/live-orders" className="text-primary mt-4 inline-block hover:underline">
            Back to Live Orders
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout searchPlaceholder="Search orders, drivers...">
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
