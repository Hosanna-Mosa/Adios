import { useEffect } from "react";

import { useDriverStore } from "@/store/driverStore";
import { API_URL } from "@/utils/apiUrl";

const POLL_MS = 5000;

/**
 * While the rider waits at the restaurant, asks the server every few seconds
 * whether the outlet has tapped "Mark as ready" — nothing pushes that to this
 * app. Once it has, `foodReadyAt` is merged into the current order, which
 * unlocks the pickup code. The rider's own status is left as it is.
 */
export function useRestaurantReadyPoll(orderId: string | undefined, enabled: boolean) {
  useEffect(() => {
    if (!enabled || !orderId) return;
    let active = true;

    const check = async () => {
      const { token } = useDriverStore.getState();
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const order = await res.json();
        const readyAt =
          order?.foodReadyAt ||
          (String(order?.status).toLowerCase() === "picking_items" ? new Date().toISOString() : null);
        const current = useDriverStore.getState().currentOrder;
        if (!active || !readyAt || current?.id !== orderId) return;
        useDriverStore.setState({ currentOrder: { ...current, foodReadyAt: readyAt } });
      } catch {
        // Offline for a moment — the next tick tries again.
      }
    };

    check();
    const timer = setInterval(check, POLL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [orderId, enabled]);
}
