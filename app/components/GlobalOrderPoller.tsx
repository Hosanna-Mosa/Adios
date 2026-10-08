import { useCallback, useRef, useState } from "react";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { useAuthStore } from "@/contexts/authStore";
import { getOrder, getOrderChat } from "@/services/orders.service";
import { usePolling, type IsCurrent } from "@/utils/usePolling";
import { nextFoodStage, normalizeStatus } from "@/features/ride/useTracking.shared";
import { mergeChatMessages, toChatMessage } from "@/features/support/useChat.shared";

// Keeps the current order's status live in the background — the active-order
// stripe on the tab bar reads it while the customer is away from tracking — and
// counts unread driver messages while the chat screen is closed.

const POLL_MS = 10000;

export function GlobalOrderPoller() {
  const user = useAuthStore((s) => s.user);
  const currentOrderId = useDeliveryStore((s) => s.currentOrderId);
  // The order whose poll came back delivered/cancelled; nothing further to fetch.
  const [finishedId, setFinishedId] = useState<string | null>(null);
  // Chat history already present when polling started is not "unread".
  const chatPrimedFor = useRef<string | null>(null);

  const poll = useCallback(async (isCurrent: IsCurrent) => {
    const orderId = currentOrderId;
    if (!orderId) return;

    const order = await getOrder(orderId);
    const store = useDeliveryStore.getState();
    if (!isCurrent() || !order || store.currentOrderId !== orderId) return;

    if (order.status) {
      const statusStr = String(order.status).toLowerCase();
      if (statusStr === "cancelled" || statusStr === "cancelled_by_driver") {
        // Before the status: screens reacting to "cancelled" read who did it from here.
        store.setCancelReason(order.cancelReason ?? null);
        store.setStatus("cancelled");
        setFinishedId(orderId);
        return;
      }
      const normalized = normalizeStatus(order.status);
      store.setStatus(normalized);
      if (normalized === "delivered") setFinishedId(orderId);
      store.setFoodStage(nextFoodStage(store.foodStage, order.status));
    }
    if (order.driver && store.driver?.id !== order.driver._id) {
      store.setDriver({
        id: order.driver._id,
        name: order.driver.name || order.driver.user?.name || order.driver.firstName || "Driver",
        phone: order.driver.phone || order.driver.user?.phone || "",
        vehicle: order.driver.vehicleType || "unknown",
        rating: order.driver.rating ?? null,
        ratingCount: order.driver.ratingCount ?? 0,
      });
    }

    // The chat screen polls its own thread while it is open.
    if (store.isChatActive) return;
    const history = await getOrderChat(orderId);
    const latest = useDeliveryStore.getState();
    if (!isCurrent() || latest.currentOrderId !== orderId || latest.isChatActive) return;
    const { merged, added } = mergeChatMessages(latest.activeChat, (history || []).map(toChatMessage));
    if (added.length) latest.setChatMessages(merged);
    if (chatPrimedFor.current !== orderId) {
      chatPrimedFor.current = orderId;
      return;
    }
    added.filter((m) => m.sender === "driver").forEach(() => latest.incrementUnreadCount());
  }, [currentOrderId]);

  usePolling(poll, POLL_MS, { enabled: !!user && !!currentOrderId && finishedId !== currentOrderId });

  return null;
}
