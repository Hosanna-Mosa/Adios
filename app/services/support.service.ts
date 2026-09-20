import { customFetch } from "@/utils/api/custom-fetch";

// Support tickets and order reviews. Paths, methods and bodies are unchanged
// from the call sites these replaced.

export const getSupportTickets = <T>() => customFetch<T>("/support/tickets");

export const createSupportTicket = <T>(body: { title: string; category: string; message: string }) =>
  customFetch<T>("/support/tickets", { method: "POST", body: JSON.stringify(body) });

export const sendTicketMessage = <T>(ticketId: string, text: string) =>
  customFetch<T>(`/support/tickets/${ticketId}/messages`, { method: "POST", body: JSON.stringify({ text }) });

/** `approve: false` re-opens the case instead of closing it. */
export const resolveTicket = <T>(ticketId: string, approve: boolean) =>
  customFetch<T>(`/support/tickets/${ticketId}/resolve`, { method: "POST", body: JSON.stringify({ approve }) });

export const getOrderReview = <T = any>(orderId: string) =>
  customFetch<T>(`/reviews/order/${orderId}`);

export const submitReview = <T = any>(body: {
  orderId: string;
  rating: number;
  comment: string;
  tags: string[];
}) => customFetch<T>("/reviews", { method: "POST", body: JSON.stringify(body) });
