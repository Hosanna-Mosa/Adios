import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type InfiniteData, type QueryClient } from "@tanstack/react-query";
import { usePartner } from "@/contexts/authStore";
import {
  acceptOrder,
  getLiveOrders,
  getOrder,
  getOrderHistory,
  getScheduledRequests,
  HISTORY_PAGE_SIZE,
  markOrderReady,
  rejectOrder,
  respondToScheduledRequest,
} from "@/services/orders.service";
import type { PartnerOrder } from "@/types/models";
import { nextHistoryCursor, startOfToday } from "@/utils/orderWindow";
import { queryKeys } from "./keys";

// Orders and scheduled requests for the signed-in outlet. Shared by the
// dashboard, the orders tab, the order screen, the tab bar badge and the
// live-alert sheet, which all read the same cache.

const fetchLiveOrders = (vendorId: string) => getLiveOrders(vendorId, startOfToday());

/** Today's orders plus anything still in progress — kept fresh by polling. */
export function useVendorOrders() {
  const partner = usePartner();
  const vendorId = partner?._id ?? "";
  return useQuery({
    queryKey: queryKeys.orders(vendorId),
    queryFn: () => fetchLiveOrders(vendorId),
    enabled: !!vendorId,
    // Polling is how new orders and status changes arrive (LiveOrderWatcher rings
    // for new ones). Mounted app-wide via the tab bar; paused in the background,
    // and refetched on return to the foreground (focusManager in app/_layout).
    refetchInterval: 10_000,
  });
}

/** Orders placed before today, a page at a time, newest first. */
export function useOrderHistory({ enabled = true }: { enabled?: boolean } = {}) {
  const partner = usePartner();
  const vendorId = partner?._id ?? "";
  return useInfiniteQuery({
    queryKey: queryKeys.orderHistory(vendorId),
    queryFn: ({ pageParam }) => getOrderHistory(vendorId, pageParam),
    // Computed when the first page is fetched, so it moves on past midnight with the live set.
    initialPageParam: startOfToday().toISOString(),
    getNextPageParam: (lastPage) => nextHistoryCursor(lastPage, HISTORY_PAGE_SIZE),
    enabled: enabled && !!vendorId,
  });
}

/** An order from whichever cache holds it — the live set or a loaded history page. */
function findCachedOrder(queryClient: QueryClient, vendorId: string, orderId: string) {
  const live = queryClient.getQueryData<PartnerOrder[]>(queryKeys.orders(vendorId));
  const history = queryClient.getQueryData<InfiniteData<PartnerOrder[]>>(queryKeys.orderHistory(vendorId));
  return live?.find((o) => o._id === orderId) ?? history?.pages.flat().find((o) => o._id === orderId);
}

/**
 * One order. GET /orders/:id populates the assigned driver (name, phone) but
 * leaves the customer as a bare id; the vendor list populates the customer.
 * The two are merged, and the list copy seeds the screen so it opens instantly.
 */
export function useVendorOrder(orderId: string) {
  const partner = usePartner();
  const queryClient = useQueryClient();
  const vendorId = partner?._id ?? "";
  const listKey = queryKeys.orders(vendorId);
  const fromList = () => findCachedOrder(queryClient, vendorId, orderId);
  return useQuery({
    queryKey: queryKeys.order(orderId),
    queryFn: async () => {
      // Opened straight from a push, a deep link or the new-order banner, the
      // live set may not be cached yet — load it alongside, since only the list
      // carries the customer. A past order is found in the loaded history instead.
      const [detail, list] = await Promise.all([
        getOrder(orderId),
        queryClient.ensureQueryData({ queryKey: listKey, queryFn: () => fetchLiveOrders(vendorId) }).catch(() => []),
      ]);
      const listed = list.find((o) => o._id === orderId) ?? fromList();
      return {
        ...listed,
        ...detail,
        user: detail.user && typeof detail.user === "object" ? detail.user : (listed?.user ?? null),
      } as PartnerOrder;
    },
    initialData: fromList,
    initialDataUpdatedAt: 0,
    enabled: !!orderId && !!partner,
    // The rider and status change while the order screen is open.
    refetchInterval: 10_000,
  });
}

/** After the kitchen changes an order: show the server's copy now, then refresh the lists. */
function useApplyOrderUpdate() {
  const partner = usePartner();
  const queryClient = useQueryClient();
  return (updated: PartnerOrder | undefined, orderId: string) => {
    if (updated?._id) {
      queryClient.setQueryData<PartnerOrder>(queryKeys.order(orderId), (prev) => ({ ...prev, ...updated }));
    }
    queryClient.invalidateQueries({ queryKey: queryKeys.orders(partner?._id ?? "") });
    queryClient.invalidateQueries({ queryKey: queryKeys.order(orderId) });
  };
}

export function useMarkOrderReady() {
  const apply = useApplyOrderUpdate();
  return useMutation({
    mutationFn: (orderId: string) => markOrderReady(orderId),
    onSuccess: apply,
  });
}

/** Accept a food order with a prep time — this is what starts the rider search. */
export function useAcceptOrder() {
  const apply = useApplyOrderUpdate();
  return useMutation({
    mutationFn: ({ orderId, prepMinutes }: { orderId: string; prepMinutes: number }) => acceptOrder(orderId, prepMinutes),
    onSuccess: (updated, { orderId }) => apply(updated, orderId),
  });
}

export function useRejectOrder() {
  const apply = useApplyOrderUpdate();
  return useMutation({
    mutationFn: (orderId: string) => rejectOrder(orderId),
    onSuccess: apply,
  });
}

/** Refreshes every cached order list: the live set and any loaded history pages. */
export function invalidateOrderLists(queryClient: QueryClient, vendorId: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.orders(vendorId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.orderHistory(vendorId) });
}

export function useScheduledRequests() {
  const partner = usePartner();
  const vendorId = partner?._id ?? "";
  return useQuery({
    queryKey: queryKeys.scheduled(vendorId),
    queryFn: () => getScheduledRequests(vendorId),
    enabled: !!vendorId,
    // Same 15 s cadence as the web panel's Scheduled Orders page.
    refetchInterval: 15_000,
  });
}

export function useRespondToScheduledRequest() {
  const partner = usePartner();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, accepted }: { requestId: string; accepted: boolean }) =>
      respondToScheduledRequest(requestId, partner?._id ?? "", accepted),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduled(partner?._id ?? "") });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders(partner?._id ?? "") });
    },
  });
}
