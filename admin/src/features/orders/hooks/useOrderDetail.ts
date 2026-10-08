import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import { useJsApiLoader } from "@react-google-maps/api";
import type { Order, MapMarker, TimelineStep } from "../orderDetailTypes";

// Where the map opens when no stop has coordinates. Only the initial viewport:
// no pin is ever placed here.
const DEFAULT_MAP_CENTER = { lat: 17.0005, lng: 81.8040 };

const formatTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Missing values and the [0, 0] GeoJSON default both mean "no location recorded".
const isRealCoordinate = (lat: unknown, lng: unknown) => {
  const la = Number(lat);
  const ln = Number(lng);
  return lat != null && lng != null && Number.isFinite(la) && Number.isFinite(ln) && !(la === 0 && ln === 0);
};

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
  let mapCenter = DEFAULT_MAP_CENTER;
  let polylinePath: { lat: number; lng: number }[] = [];

  if (order) {
    // Each step shows a time only when the order records one for it: createdAt
    // for the confirmation, and the accepted dispatch offer for the driver step
    // (food orders). The other steps used to all print order.updatedAt, which is
    // just the last time anything on the order changed.
    const driverAcceptedAt = order.dispatch?.offers?.find((o) => o.outcome === "accepted")?.respondedAt;
    timelineSteps = [
      {
        time: formatTime(order.createdAt),
        title: t("orders.orderConfirmed"),
        desc: t("orders.systemValidatedRoutingDesc"),
        status: "completed"
      },
      {
        time: order.driver ? formatTime(driverAcceptedAt) : "",
        title: t("orders.driverAssignedTitle"),
        desc: order.driver ? t("orders.acceptedTheRoute", { name: order.driver.user?.name || t("orders.driver"), defaultValue: "{{name}} accepted the route." }) : t("orders.waitingForDriverAcceptance"),
        status: order.driver ? "completed" : "pending",
        label: order.driver ? undefined : t("orders.awaitingDriverLabel")
      },
      {
        time: "",
        title: t("orders.pickedUp"),
        desc: ["PICKED_UP", "DELIVERED", "COMPLETED"].includes(order.status) ? t("orders.itemsCollectedDesc") : t("orders.driverHeadingToMerchant"),
        status: ["PICKED_UP", "DELIVERED", "COMPLETED"].includes(order.status) ? "completed" : order.status === "DRIVER_ASSIGNED" ? "in_progress" : "pending",
        label: order.status === "DRIVER_ASSIGNED" ? t("orders.enRouteToMerchantLabel") : undefined
      },
      {
        time: "",
        title: t("orderStatus.delivered"),
        desc: ["DELIVERED", "COMPLETED"].includes(order.status) ? t("orders.finalSignatureDeliveryDesc") : t("orders.inTransitToDestination"),
        status: ["DELIVERED", "COMPLETED"].includes(order.status) ? "completed" : order.status === "PICKED_UP" ? "in_progress" : "pending",
        label: order.status === "PICKED_UP" ? t("orders.inTransitCapsLabel") : undefined
      }
    ];

    // Only stops with real coordinates get a pin. A stop without them used to be
    // pinned at a fixed fallback point, so the map showed places the order never went.
    mapMarkers = (order.stops || []).flatMap((stop, idx) => {
      const [lng, lat] = stop.location?.coordinates || [];
      if (!isRealCoordinate(lat, lng)) return [];
      return [{
        lat: Number(lat),
        lng: Number(lng),
        label: String(idx + 1),
        address: stop.address || t("orders.stop"),
        type: stop.type
      }];
    });

    mapCenter = mapMarkers.length > 0 ? { lat: mapMarkers[0].lat, lng: mapMarkers[0].lng } : DEFAULT_MAP_CENTER;
    polylinePath = mapMarkers.map((m) => ({ lat: m.lat, lng: m.lng }));
  }

  // "Contact Driver" dials the driver's real number when the order carries it.
  // It used to toast "VoIP call initiated" without calling anyone.
  const driverPhone = order?.driver?.user?.phone || undefined;

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
    driverPhone,
  };
}
