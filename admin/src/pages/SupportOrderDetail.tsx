import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Eye } from "lucide-react";
import { useJsApiLoader } from "@react-google-maps/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OrderRouteMap } from "@/features/orders/components/OrderRouteMap";
import { DEFAULT_MAP_CENTER, GOOGLE_MAPS_LOADER_OPTIONS, isRealCoordinate } from "@/features/orders/hooks/useOrderDetail";
import { useSupportOrder } from "@/features/support/hooks/useSupportOrders";
import { SupportOrderDetails } from "@/features/support/components/orders/SupportOrderDetails";

/** Support desk → one order, read-only, with its route on the map. */
export default function SupportOrderDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: order, isLoading, isError } = useSupportOrder(id);
  const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_LOADER_OPTIONS);
  const [zoom, setZoom] = useState(13);
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");

  const mapMarkers = (order?.stops ?? []).flatMap((stop, i) => {
    const [lng, lat] = stop.location?.coordinates ?? [];
    if (!isRealCoordinate(lat, lng)) return [];
    return [{ lat: Number(lat), lng: Number(lng), label: String(i + 1), address: stop.address || t("orders.stop"), type: stop.type }];
  });
  const mapCenter = mapMarkers[0] ? { lat: mapMarkers[0].lat, lng: mapMarkers[0].lng } : DEFAULT_MAP_CENTER;

  return (
    <DashboardLayout searchPlaceholder={t("supportOrders.searchPlaceholder")}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/support/orders"))}
            className="rounded-xl border border-border bg-card p-2 shadow-sm transition-colors hover:bg-muted"
            title={t("supportOrders.back")}
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div>
            <h1 className="page-header">{t("supportOrders.orderDetails")}</h1>
            <p className="page-subtitle flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" /> {t("supportOrders.viewOnlyNotice")}
            </p>
          </div>
        </div>

        {isLoading ? (
          <p className="py-20 text-center text-sm text-muted-foreground">{t("supportOrders.loadingOrder")}</p>
        ) : isError || !order ? (
          <div className="py-20 text-center">
            <h2 className="text-xl font-bold text-foreground">{t("orders.orderNotFound")}</h2>
            <Link to="/support/orders" className="mt-4 inline-block text-primary hover:underline">{t("supportOrders.backToSearch")}</Link>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
            <SupportOrderDetails order={order} />
            <div className="section-card flex min-h-[420px] overflow-hidden xl:sticky xl:top-4 xl:h-[calc(100vh-10rem)]">
              <OrderRouteMap
                isLoaded={isLoaded}
                mapCenter={mapCenter}
                zoom={zoom}
                setZoom={setZoom}
                mapType={mapType}
                setMapType={setMapType}
                mapMarkers={mapMarkers}
                polylinePath={mapMarkers.map((m) => ({ lat: m.lat, lng: m.lng }))}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
