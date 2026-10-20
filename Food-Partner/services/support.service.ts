import { customFetch } from "@/utils/api/custom-fetch";
import type { SupportTicket } from "@/types/models";

// Support cases — the same /support/tickets endpoints the customer and driver
// apps use. The backend files a partner's case under its outlet account.

export const getSupportTickets = () => customFetch<SupportTicket[]>("/support/tickets");

/** `orderId`: one of this outlet's orders, so the support agent opens the case with it in view. */
export const createSupportTicket = (body: { title: string; category: string; message: string; orderId?: string }) =>
  customFetch<SupportTicket>("/support/tickets", { method: "POST", body: JSON.stringify(body) });

export const sendTicketMessage = (ticketId: string, text: string) =>
  customFetch<SupportTicket>(`/support/tickets/${ticketId}/messages`, { method: "POST", body: JSON.stringify({ text }) });

/** `approve: false` keeps the case open instead of closing it. */
export const resolveTicket = (ticketId: string, approve: boolean) =>
  customFetch<SupportTicket>(`/support/tickets/${ticketId}/resolve`, { method: "POST", body: JSON.stringify({ approve }) });
