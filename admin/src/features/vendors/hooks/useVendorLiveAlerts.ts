import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import { playNewOrderChime } from "@/lib/notificationSound";
import { needsAcceptance, type VendorOrder } from "../vendorDashboardTypes";
import type { ScheduledRequest } from "../vendorScheduledOrdersTypes";

// How often the vendor's orders and scheduled requests are re-read. This is
// what used to arrive instantly over the socket, so it stays short.
export const VENDOR_LIVE_REFRESH_MS = 15_000;
// An order seen for the first time is only announced if it was placed this
// recently — an older one showing up (e.g. after the laptop woke from sleep)
// is no longer something to chime about.
const NEW_ORDER_WINDOW_MS = 30 * 60_000;
// A non-food (sequential) order still waiting on the shop: not yet marked ready.
const AWAITING_STATUSES = new Set(["created", "searching_driver", "driver_assigned", "arrived_pickup"]);

const startOfTodayIso = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const isAwaitingRestaurant = (order: VendorOrder) => {
  if (order.isReserved) return false;
  if (order.dispatchMode === "broadcast") return needsAcceptance(order);
  return AWAITING_STATUSES.has((order.status || "").toLowerCase());
};

const formatOrderId = (id: string) => (id.startsWith("ORD-") ? id : `#${id.slice(-6).toUpperCase()}`);

/**
 * The new-order and new-scheduled-request alerts (chime + toast) for every
 * /vendor/* page, mounted once by VendorLayout. Polls instead of listening on
 * the socket: anything not seen on the previous read is new. The first
 * successful read only seeds what has been seen, so opening the page never
 * replays alerts for orders that were already there.
 */
export function useVendorLiveAlerts(vendorId?: string) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const seenOrderIds = useRef<Set<string> | null>(null);
  const seenRequestIds = useRef<Set<string> | null>(null);

  // A distinct key from the dashboard's ["vendor-orders", id], which caches
  // the full (unwindowed) list — sharing it would swap one shape for the other.
  const { data: liveOrders } = useQuery({
    queryKey: ["vendor-orders-live", vendorId],
    queryFn: () => adminFetch<VendorOrder[]>(`/orders/vendor/${vendorId}?since=${encodeURIComponent(startOfTodayIso())}`),
    enabled: !!vendorId,
    refetchInterval: VENDOR_LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
  });

  // Same key/endpoint as useVendorScheduledOrders and useVendorDashboard, so
  // all three share one cached list and one request.
  const { data: scheduledRequests } = useQuery({
    queryKey: ["vendor-scheduled-orders", vendorId],
    queryFn: () => adminFetch<ScheduledRequest[]>(`/orders/scheduled-delivery/vendor/${vendorId}`),
    enabled: !!vendorId,
    refetchInterval: VENDOR_LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    if (!liveOrders) return;
    if (!seenOrderIds.current) {
      seenOrderIds.current = new Set(liveOrders.map((o) => o._id));
      return;
    }
    const seen = seenOrderIds.current;
    const now = Date.now();
    const fresh = liveOrders.filter((o) => !seen.has(o._id));
    fresh.forEach((o) => seen.add(o._id));

    const toAnnounce = fresh.filter(
      (o) => isAwaitingRestaurant(o) && now - new Date(o.createdAt).getTime() <= NEW_ORDER_WINDOW_MS,
    );
    if (fresh.length > 0) {
      queryClient.invalidateQueries({ queryKey: ["vendor-orders", vendorId] });
    }
    if (toAnnounce.length === 0) return;

    playNewOrderChime();
    toAnnounce.forEach((o) => {
      toast.success(
        t("vendorDashboard.newOrderReceived", {
          id: formatOrderId(String(o._id)),
          defaultValue: "New order received! Order {{id}}",
        }),
        { duration: 8000 },
      );
    });
  }, [liveOrders, vendorId, queryClient, t]);

  useEffect(() => {
    if (!scheduledRequests) return;
    if (!seenRequestIds.current) {
      seenRequestIds.current = new Set(scheduledRequests.map((r) => r.requestId));
      return;
    }
    const seen = seenRequestIds.current;
    const fresh = scheduledRequests.filter((r) => !seen.has(r.requestId));
    fresh.forEach((r) => seen.add(r.requestId));

    const pending = fresh.filter((r) => r.status === "pending");
    if (pending.length === 0) return;

    playNewOrderChime();
    pending.forEach((r) => {
      toast.info(
        t("vendorDashboard.newScheduledDeliveryRequestFor", {
          when: new Date(r.scheduledFor).toLocaleString(),
          defaultValue: "New scheduled delivery request for {{when}}",
        }),
        { duration: 8000 },
      );
    });
  }, [scheduledRequests, t]);
}
