import { useCallback, useEffect, useRef } from "react";
import { router } from "expo-router";
import i18n from "@/i18n";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { getOrder, getOrderChat, sendOrderChatMessage } from "@/services/orders.service";
import { showAlert } from "@/components/ui/AppAlert";
import { STARTED_STATUSES } from "@/components/shared/helperTaskStatus";
import { usePolling, type IsCurrent } from "@/utils/usePolling";
import { mergeChatMessages, toChatMessage } from "./useChat.shared";

// Split out of useChat so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

/** New messages while the chat is open. */
const CHAT_POLL_MS = 3000;
/** A helper task starting moves the customer to tracking. */
const ORDER_POLL_MS = 5000;

export function useChatSendMessage(currentOrderId: any, driver: any, addChatMessage: any, setUnreadCount: any, setIsChatActive: any, setInputText: any, flatListRef: any, isHelper: boolean) {
  useEffect(() => {
    if (!currentOrderId) return;
    setUnreadCount(0);
    setIsChatActive(true);
    return () => setIsChatActive(false);
  }, [currentOrderId]);

  const scrollToEnd = () => setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

  const pollChat = useCallback(async (isCurrent: IsCurrent) => {
    if (!currentOrderId) return;
    const history = await getOrderChat(currentOrderId);
    const store = useDeliveryStore.getState();
    if (!isCurrent() || store.currentOrderId !== currentOrderId) return;
    const { merged, added } = mergeChatMessages(store.activeChat, (history || []).map(toChatMessage));
    if (!added.length) return;
    store.setChatMessages(merged);
    scrollToEnd();
  }, [currentOrderId]);

  // Only a start seen after the chat opened navigates; a task already under way
  // when the chat was opened (from tracking) stays put.
  const startedOnOpen = useRef<boolean | null>(null);
  const pollTaskStart = useCallback(async (isCurrent: IsCurrent) => {
    if (!currentOrderId || !isHelper) return;
    const order = await getOrder(currentOrderId);
    if (!isCurrent() || !order) return;
    const started = STARTED_STATUSES.includes(order.status);
    if (startedOnOpen.current === null) {
      startedOnOpen.current = started;
      return;
    }
    if (started && !startedOnOpen.current) {
      startedOnOpen.current = true;
      router.push("/tracking");
    }
  }, [currentOrderId, isHelper]);

  const { refresh: refreshChat, refreshing } = usePolling(pollChat, CHAT_POLL_MS, { enabled: !!currentOrderId });
  const { refresh: refreshOrder } = usePolling(pollTaskStart, ORDER_POLL_MS, { enabled: !!currentOrderId && isHelper });
  const refresh = useCallback(() => {
    refreshChat();
    if (isHelper) refreshOrder();
  }, [refreshChat, refreshOrder, isHelper]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !currentOrderId) return;
    const msgId = Date.now().toString();
    const newMsg: any = {
      id: msgId,
      text: text.trim(),
      sender: "customer",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    addChatMessage(newMsg);
    setInputText("");
    scrollToEnd();
    try {
      await sendOrderChatMessage(currentOrderId, newMsg.text, msgId);
    } catch (err: any) {
      // Not delivered: take the bubble back out so it is not mistaken for sent.
      const store = useDeliveryStore.getState();
      store.setChatMessages(store.activeChat.filter((m) => m.id !== msgId));
      showAlert(i18n.t("app.support.messageNotSent"), err?.message || i18n.t("app.ride.pleaseTryAgain"));
    }
  };

  return { sendMessage, refresh, refreshing };
}
