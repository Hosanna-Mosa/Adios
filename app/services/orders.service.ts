import { customFetch } from "@/utils/api/custom-fetch";
import type { Order } from "@/types/models";
import { trackEvent } from "@/utils/analytics";

// Every /orders call the app makes. Paths, methods and bodies are unchanged
// from the call sites these replaced.
//
// Order creation stays `unknown`-bodied on purpose: ride, helper and delivery
// each post a different payload, and inventing one union would either be wrong
// or force casts at every caller.

export const getOrders = () => customFetch<Order[]>("/orders");

export const getOrder = (id: string) => customFetch<any>(`/orders/${id}`);

/** finding-driver polls this and needs the JSON path even on an empty body. */
export const getOrderJson = (id: string) =>
  customFetch<any>(`/orders/${id}`, { responseType: "json" });

export const createOrder = async <T = { _id: string }>(body: unknown) => {
  const order = await customFetch<T>("/orders", { method: "POST", body: JSON.stringify(body) });
  const b = body as { serviceType?: string; totals?: { total?: number }; isReserved?: boolean };
  trackEvent("order_placed", {
    service_type: b?.serviceType,
    value: b?.totals?.total,
    currency: "INR",
    payment: "cash",
    scheduled: !!b?.isReserved,
  });
  return order;
};

/** `query` is already-encoded search params — a string or URLSearchParams. */
export const estimateFare = <T>(query: string | URLSearchParams) =>
  customFetch<T>(`/orders/estimate-fare?${query}`, { responseType: "json" });

/** The only status the app ever sets is CANCELLED. */
export const cancelOrder = async (id: string) => {
  const res = await customFetch(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: "CANCELLED" }) });
  trackEvent("order_cancelled");
  return res;
};

export const setOrderStatus = (id: string, status: string) =>
  customFetch(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });

export const raiseSos = (id: string) =>
  customFetch(`/orders/${id}/sos`, { method: "POST" });

export const increaseOrderPrice = (id: string, amount: number) =>
  customFetch<any>(`/orders/${id}/increase-price`, { method: "PATCH", body: JSON.stringify({ amount }) });

/** Rebuilds a cart from a past order; returns the cart, not the order. */
export const reorder = <T = { vendorId: string | null; items: any[] }>(orderId: string) =>
  customFetch<T>(`/orders/${orderId}/reorder`, { method: "POST" });

export const getOrderChat = (id: string) => customFetch<any[]>(`/orders/${id}/chat`);

/** Sends a chat line; `clientId` is the optimistic message's id, echoed back as `id`. */
export const sendOrderChatMessage = (id: string, text: string, clientId: string) =>
  customFetch<{ message: { id: string; text: string; from: string; time: string; senderId: string; createdAt: string } }>(
    `/orders/${id}/chat`,
    { method: "POST", body: JSON.stringify({ text, clientId }) },
  );

/** Customer confirms the helper task from chat. */
export const confirmHelperTask = (id: string) =>
  customFetch<{ helperTaskConfirmedAt: string }>(`/orders/${id}/helper/confirm-task`, { method: "POST" });
