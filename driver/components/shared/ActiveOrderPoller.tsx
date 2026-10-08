import { useEffect, useRef } from "react";

import { usePolling } from "@/hooks/usePolling";
import { syncActiveOrder } from "@/store/activeOrderSync";
import { useDriverStore } from "@/store/driverStore";
import { API_URL } from "@/utils/apiUrl";
import { formatCustomerChatMessage } from "@/utils/chatMessages";

export const ACTIVE_ORDER_POLL_MS = 5000;
const CHAT_POLL_MS = 10 * 1000;

/** While the driver has a job: polls its status (cancellation included) and,
 * when the chat screen isn't open, its chat for new customer messages to count
 * as unread. Replaces the old socket listeners. */
export function ActiveOrderPoller() {
  const currentOrderId = useDriverStore((s) => s.currentOrder?.id);
  const isChatActive = useDriverStore((s) => s.isChatActive);

  usePolling(syncActiveOrder, ACTIVE_ORDER_POLL_MS, !!currentOrderId);

  // Message ids already seen for this order; the first load only fills it.
  // Re-seeded when the chat screen closes (it showed everything up to then).
  const seen = useRef<{ orderId: string | null; ids: Set<string> | null }>({ orderId: null, ids: null });
  useEffect(() => {
    seen.current = { orderId: currentOrderId ?? null, ids: null };
  }, [currentOrderId, isChatActive]);

  usePolling(
    async () => {
      const { token, currentOrder } = useDriverStore.getState();
      if (!token || !currentOrder) return;
      const orderId = String(currentOrder.id);
      const res = await fetch(`${API_URL}/orders/${orderId}/chat`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const body = await res.json();
      const items: any[] = Array.isArray(body) ? body : body?.messages || [];

      const store = useDriverStore.getState();
      if (String(store.currentOrder?.id) !== orderId || seen.current.orderId !== orderId) return;
      const firstLoad = !seen.current.ids;
      const ids = seen.current.ids ?? new Set<string>();
      seen.current.ids = ids;

      for (const item of items) {
        const id = String(item?.id || item?.clientId || item?._id || "");
        if (!id || ids.has(id)) continue;
        ids.add(id);
        if (firstLoad || store.isChatActive) continue;
        const msg = formatCustomerChatMessage({ ...item, id });
        if (!msg) continue;
        if (!useDriverStore.getState().activeChat.some((m) => m.id === msg.id)) store.addChatMessage(msg);
        store.incrementUnreadCount();
      }
    },
    CHAT_POLL_MS,
    !!currentOrderId && !isChatActive,
  );

  return null;
}
