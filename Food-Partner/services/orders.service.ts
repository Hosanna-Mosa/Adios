import { customFetch } from "@/utils/api/custom-fetch";
import type { PartnerOrder, ScheduledRequest } from "@/types/models";

// Orders and scheduled-delivery requests for the signed-in outlet — the calls
// admin/src/features/vendors/hooks/useVendorDashboard.ts and
// useVendorScheduledOrders.ts make.

/** How many past orders one page of history holds. */
export const HISTORY_PAGE_SIZE = 25;

/**
 * The live set: every order placed since `since` (the start of today), plus any
 * older one that is still in progress — what the dashboard, the Active tab and
 * the tab-bar badge show. The full history is paged, see getOrderHistory.
 */
export const getLiveOrders = (vendorId: string, since: Date) =>
  customFetch<PartnerOrder[]>(`/orders/vendor/${vendorId}?since=${encodeURIComponent(since.toISOString())}`);

/** One page of orders placed before `before`, newest first. */
export const getOrderHistory = (vendorId: string, before: string) =>
  customFetch<PartnerOrder[]>(
    `/orders/vendor/${vendorId}?before=${encodeURIComponent(before)}&limit=${HISTORY_PAGE_SIZE}`,
  );

export const getOrder = (orderId: string) => customFetch<PartnerOrder>(`/orders/${orderId}`);

/** A restaurant may only mark an order ready ("picking_items") or cancel it — the backend enforces this. */
export const markOrderReady = (orderId: string) =>
  customFetch<PartnerOrder>(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "picking_items" }),
  });

/** Accepts a food order with a prep time; the backend starts looking for a rider. */
export const acceptOrder = (orderId: string, prepMinutes: number) =>
  customFetch<PartnerOrder>(`/orders/${orderId}/restaurant-accept`, {
    method: "POST",
    body: JSON.stringify({ prepMinutes }),
  });

/** Turns a food order down. The customer is told and an online payment is refunded. */
export const rejectOrder = (orderId: string) =>
  customFetch<PartnerOrder>(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "CANCELLED" }),
  });

export const getScheduledRequests = (vendorId: string) =>
  customFetch<ScheduledRequest[]>(`/orders/scheduled-delivery/vendor/${vendorId}`);

export const respondToScheduledRequest = (requestId: string, vendorId: string, accepted: boolean) =>
  customFetch(`/orders/scheduled-delivery/${requestId}/respond`, {
    method: "PATCH",
    body: JSON.stringify({ vendorId, accepted }),
  });
