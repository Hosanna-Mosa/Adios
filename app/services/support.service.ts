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

// ---- Support bot -----------------------------------------------------------------------
// Predefined questions answered by the backend from the customer's live data
// (backend/src/modules/supportBot).

export type BotCategory = "ride" | "food" | "meat" | "package" | "helper" | "payment" | "general";

export interface BotIntent {
  key: string;
  category: BotCategory;
  question: string;
  needsOrder: boolean;
  helpfulCount: number;
}

export interface BotLimit {
  limitReached: boolean;
  remaining: number;
  max: number;
}

export interface BotIntentsResponse extends BotLimit {
  categories: BotCategory[];
  intents: BotIntent[];
}

export interface BotQuery {
  queryId: string;
  status: "queued" | "done" | "failed";
  answer: string;
  question: string;
  orderId: string | null;
  helpful: boolean | null;
  ticketId: string | null;
}

export interface BotOrder {
  id: string;
  category: BotCategory;
  status: string;
  stage: string;
  totalPrice?: number;
  createdAt: string;
}

export const getBotIntents = (lang: string) => customFetch<BotIntentsResponse>(`/support/bot/intents?lang=${lang}`);

export const getBotOrders = (category?: BotCategory) =>
  customFetch<BotOrder[]>(`/support/bot/orders${category ? `?category=${category}` : ""}`);

export const askBot = (body: { intentKey: string; orderId?: string; lang: string }) =>
  customFetch<{ queryId: string; orderId: string | null }>("/support/bot/ask", { method: "POST", body: JSON.stringify(body) });

export const getBotQuery = (queryId: string) => customFetch<BotQuery>(`/support/bot/queries/${queryId}`);

export const sendBotFeedback = (queryId: string, helpful: boolean) =>
  customFetch<BotLimit>(`/support/bot/queries/${queryId}/feedback`, { method: "POST", body: JSON.stringify({ helpful }) });

export const escalateBotQuery = (queryId: string) =>
  customFetch<{ ticketId: string }>(`/support/bot/queries/${queryId}/escalate`, { method: "POST" });
