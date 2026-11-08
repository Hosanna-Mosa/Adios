import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/contexts/authStore";
import { useOrderAlertStore } from "@/contexts/orderAlertStore";
import { useScheduledRequests, useVendorOrders } from "@/queries/orders.queries";
import { newOrdersToAlert, newScheduledRequestsToAlert } from "@/utils/liveOrderDiff";
import { alertNewOrder, alertScheduledRequest } from "./liveAlerts";

// Mounted once at the root, for the whole signed-in session — the same job
// VendorLayout does for every page of the web vendor panel. A new-order alert
// that only fired on the dashboard would miss every order that arrived while
// the partner was editing the menu, which is exactly when it matters.
//
// Sockets are off, so new orders and scheduled requests are found by polling:
// each poll of the live set (10 s) and of scheduled requests (15 s) is compared
// with the ids already seen, and only the new ones ring. The first load only
// records what is there — nothing already waiting rings on launch. With the app
// closed, the push sent for each order does this job instead.

interface Known {
  vendorId: string | null;
  orders: Set<string> | null;
  scheduled: Set<string> | null;
}

const empty = (vendorId: string | null): Known => ({ vendorId, orders: null, scheduled: null });

export function LiveOrderWatcher() {
  const token = useAuthStore((s) => s.token);
  const vendorId = useAuthStore((s) => s.partner?._id) ?? null;
  const queryClient = useQueryClient();
  const { data: orders } = useVendorOrders();
  const { data: requests } = useScheduledRequests();
  const known = useRef<Known>(empty(null));

  // A new outlet (or a sign-out) starts from nothing: its first load is seeded,
  // not rung. Declared first, so it runs before the effects below in the same commit.
  useEffect(() => {
    known.current = empty(vendorId);
    if (!token || !vendorId) useOrderAlertStore.getState().reset();
  }, [token, vendorId]);

  useEffect(() => {
    if (!token || !vendorId || !orders) return;
    const seen = known.current.orders;
    known.current.orders = new Set([...(seen ?? []), ...orders.map((o) => o._id)]);
    if (!seen) return;
    // alertNewOrder refetches the lists; those ids are already known, so the refetch can't ring again.
    newOrdersToAlert(orders, seen).forEach((order) => {
      const customer = order.user && typeof order.user === "object" ? order.user : null;
      alertNewOrder(queryClient, vendorId, { orderId: order._id, customerName: customer?.name, totalPrice: order.totalPrice });
    });
  }, [orders, token, vendorId, queryClient]);

  useEffect(() => {
    if (!token || !vendorId || !requests) return;
    const seen = known.current.scheduled;
    known.current.scheduled = new Set([...(seen ?? []), ...requests.map((r) => r.requestId)]);
    if (!seen) return;
    newScheduledRequestsToAlert(requests, seen).forEach((request) => {
      alertScheduledRequest(queryClient, vendorId, {
        requestId: request.requestId,
        customerName: request.customerName,
        customerPhone: request.customerPhone,
        scheduledFor: request.scheduledFor,
      });
    });
  }, [requests, token, vendorId, queryClient]);

  return null;
}
