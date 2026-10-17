import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-client";
import type { SupportOrder, SupportOrderChatMessage, SupportOrderPage, SupportOrderSearchParams } from "../supportOrderTypes";

const toQueryString = (params: SupportOrderSearchParams) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

/** One page of GET /support/orders. Keeps the last page on screen while the next one loads. */
export function useSupportOrderSearch(params: SupportOrderSearchParams, enabled = true) {
  return useQuery({
    queryKey: ["support", "orders", params],
    queryFn: () => adminFetch<SupportOrderPage>(`/support/orders${toQueryString(params)}`),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useSupportOrder(id: string | null | undefined) {
  return useQuery({
    queryKey: ["support", "order", id],
    queryFn: () => adminFetch<SupportOrder>(`/support/orders/${encodeURIComponent(id!)}`),
    enabled: !!id,
    retry: false,
  });
}

/** The customer ↔ driver chat on the order. Loaded only when the agent opens it. */
export function useSupportOrderChat(id: string | null | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["support", "order", id, "chat"],
    queryFn: () => adminFetch<SupportOrderChatMessage[]>(`/support/orders/${encodeURIComponent(id!)}/chat`),
    enabled: !!id && enabled,
  });
}

/** Links a ticket to an order (or unlinks it with null). Changes the ticket only, never the order. */
export function useLinkTicketOrder(ticketId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string | null) =>
      adminFetch(`/admin/tickets/${ticketId}`, { method: "PUT", body: JSON.stringify({ orderId }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] }),
  });
}
