import type { ChatMessage } from "@/store/driverStore";

const CUSTOMER_MESSAGE_SENDERS = new Set(["user", "customer", "passenger", "client"]);

export function isCustomerChatMessage(data: any): boolean {
  const sender = String(data?.from ?? data?.role ?? data?.sender ?? "").toLowerCase();
  return CUSTOMER_MESSAGE_SENDERS.has(sender);
}

/**
 * One stored ChatMessage document as the chat list renders it. `clientId` is the
 * id the sender's socket payload carried, so a history refetch lines up with the
 * live messages already on screen instead of duplicating them.
 */
export function formatStoredChatMessage(m: any): ChatMessage | null {
  if (!m?.text) return null;
  return {
    id: String(m.clientId || m._id),
    text: String(m.text),
    from: m.role === "driver" ? "driver" : "user",
    time: m.time || "",
  };
}

export function formatCustomerChatMessage(data: any): ChatMessage | null {
  if (!data?.text || !isCustomerChatMessage(data)) {
    return null;
  }

  return {
    id: String(data.id || `${Date.now()}${Math.random()}`),
    text: String(data.text),
    from: "user",
    time: data.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

