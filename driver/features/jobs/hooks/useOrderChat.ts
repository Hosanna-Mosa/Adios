import { useCallback, useRef, useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";

import { usePolling } from "@/hooks/usePolling";
import { useDriverStore } from "@/store/driverStore";
import type { ChatMessage } from "@/store/types";
import { API_URL as apiUrl } from "@/utils/apiUrl";
import { formatStoredChatMessage } from "@/utils/chatMessages";

const CHAT_POLL_MS = 3000;
const ORDER_POLL_MS = 5000;

const sameThread = (a: ChatMessage[], b: ChatMessage[]) =>
  a.length === b.length && a.every((m, i) => m.id === b[i].id && m.text === b[i].text);

/** The order chat over REST: polls the thread every 3 s, sends with an
 * optimistic copy, and (for an active helper job) polls the order every 5 s
 * for the customer's task confirmation. */
export function useOrderChat(orderId: string | undefined, watchTaskConfirmation: boolean) {
  const { t } = useTranslation();
  const token = useDriverStore((s) => s.token);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [canStartTask, setCanStartTask] = useState(false);
  // Optimistic messages whose POST hasn't been confirmed by a refetch yet.
  const pending = useRef(new Map<string, ChatMessage>());

  const { run: pollChat, refresh: refreshChat, refreshing: refreshingChat, mounted } = usePolling(
    async () => {
      if (!orderId || !token) {
        setLoadingHistory(false);
        return;
      }
      try {
        const res = await fetch(`${apiUrl}/orders/${orderId}/chat`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok || !mounted.current) return;
        const body = await res.json();
        const items: any[] = Array.isArray(body) ? body : body?.messages || [];
        const stored = items.map(formatStoredChatMessage).filter(Boolean) as ChatMessage[];
        const seen = new Set(stored.map((m) => m.id));
        for (const id of seen) pending.current.delete(id);
        const next = [...stored, ...[...pending.current.values()].filter((m) => !seen.has(m.id))];
        const store = useDriverStore.getState();
        if (!sameThread(store.activeChat || [], next)) store.setChatMessages(next);
      } finally {
        if (mounted.current) setLoadingHistory(false);
      }
    },
    CHAT_POLL_MS,
    !!orderId && !!token,
  );

  const { refresh: refreshOrder } = usePolling(
    async () => {
      if (!orderId || !token) return;
      const res = await fetch(`${apiUrl}/orders/${orderId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const order = await res.json();
      if (mounted.current && order?.helperTaskConfirmedAt) setCanStartTask(true);
    },
    ORDER_POLL_MS,
    !!orderId && !!token && watchTaskConfirmation && !canStartTask,
  );

  const refresh = useCallback(async () => {
    await Promise.all([refreshChat(), watchTaskConfirmation ? refreshOrder() : undefined]);
  }, [refreshChat, refreshOrder, watchTaskConfirmation]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!orderId || !token) return;
      const clientId = `${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const optimistic: ChatMessage = { id: clientId, text, from: "driver", time };
      pending.current.set(clientId, optimistic);
      useDriverStore.getState().addChatMessage(optimistic);

      try {
        const res = await fetch(`${apiUrl}/orders/${orderId}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ text, clientId }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || t("jobs.connectionFailedPleaseTryAgain"));
        }
        pollChat();
      } catch (err: any) {
        pending.current.delete(clientId);
        const store = useDriverStore.getState();
        store.setChatMessages((store.activeChat || []).filter((m) => m.id !== clientId));
        Alert.alert(t("chat.messageNotSent"), err?.message || t("jobs.connectionFailedPleaseTryAgain"));
      }
    },
    [orderId, token, t, pollChat],
  );

  // Nothing to load without an order or a session.
  return { loadingHistory: loadingHistory && !!orderId && !!token, canStartTask, sendMessage, refresh, refreshing: refreshingChat };
}
