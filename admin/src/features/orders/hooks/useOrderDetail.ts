import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { useJsApiLoader } from "@react-google-maps/api";
import type { Order, MapMarker, TimelineStep } from "../orderDetailTypes";

/** All state/query/derived-data logic for OrderDetail.tsx (work queue item #18). */
export function useOrderDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [zoom, setZoom] = useState(13);
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyD23mZxzw78gBlz6EGEZ6BMgCwc4fygJMA",
  });

  const { data: order, isLoading } = useQuery({
    queryKey: ["admin", "order", id],
    queryFn: () => adminFetch<Order>(`/admin/orders/${id}`),
    enabled: !!id,
  });

  let timelineSteps: TimelineStep[] = [];
  let mapMarkers: MapMarker[] = [];
  let mapCenter = { lat: 17.0005, lng: 81.8040 };
  let polylinePath: { lat: number; lng: number }[] = [];

  if (order) {
    // Construct dynamic timeline steps based on order status and creation/update times
    timelineSteps = [
      {
        time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: t("orders.orderConfirmed"),
        desc: t("orders.systemValidatedRoutingDesc"),
        status: "completed"
      },
      {
        time: order.driver ? new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
        title: t("orders.driverAssignedTitle"),
        desc: order.driver ? t("orders.acceptedTheRoute", { name: order.driver.user?.name || "Marcus Rodriguez", defaultValue: "{{name}} accepted the route." }) : t("orders.waitingForDriverAcceptance"),
        status: order.driver ? "completed" : "pending",
        label: order.driver ? undefined : t("orders.awaitingDriverLabel")
      },
      {
        time: ["PICKED_UP", "DELIVERED", "COMPLETED"].includes(order.status) ? new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
        title: t("orders.pickedUp"),
        desc: ["PICKED_UP", "DELIVERED", "COMPLETED"].includes(order.status) ? t("orders.itemsCollectedDesc") : t("orders.driverHeadingToMerchant"),
        status: ["PICKED_UP", "DELIVERED", "COMPLETED"].includes(order.status) ? "completed" : order.status === "DRIVER_ASSIGNED" ? "in_progress" : "pending",
        label: order.status === "DRIVER_ASSIGNED" ? t("orders.enRouteToMerchantLabel") : undefined
      },
      {
        time: ["DELIVERED", "COMPLETED"].includes(order.status) ? new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
        title: t("orderStatus.delivered"),
        desc: ["DELIVERED", "COMPLETED"].includes(order.status) ? t("orders.finalSignatureDeliveryDesc") : t("orders.inTransitToDestination"),
        status: ["DELIVERED", "COMPLETED"].includes(order.status) ? "completed" : order.status === "PICKED_UP" ? "in_progress" : "pending",
        label: order.status === "PICKED_UP" ? t("orders.inTransitCapsLabel") : undefined
      }
    ];

    mapMarkers = order.stops?.map((stop, idx) => {
      const lng = stop.location?.coordinates?.[0] || 81.8040;
      const lat = stop.location?.coordinates?.[1] || 17.0005;
      return {
        lat: Number(lat),
        lng: Number(lng),
        label: String(idx + 1),
        address: stop.address || t("orders.stop"),
        type: stop.type
      };
    }).filter((m) => !isNaN(m.lat) && !isNaN(m.lng)) || [];

    mapCenter = mapMarkers.length > 0 ? { lat: mapMarkers[0].lat, lng: mapMarkers[0].lng } : { lat: 17.0005, lng: 81.8040 };
    polylinePath = mapMarkers.map((m) => ({ lat: m.lat, lng: m.lng }));
  }

  const handleContactDriver = () => {
    if (order?.driver) {
      toast.success(t("orders.voipCallInitiatedTo", { name: order.driver.user?.name || t("orders.driver"), defaultValue: "VoIP call initiated to {{name}}" }));
    } else {
      toast.error(t("orders.noDriverAssignedYet"));
    }
  };

  return {
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
  };
}
