import { useCallback, useEffect } from "react";
import { AppState } from "react-native";
import { useDriverStore } from "@/store/driverStore";
import { API_URL as apiUrl } from "@/utils/apiUrl";
import type { Order } from "@/store/types";

const POLL_MS = 15 * 1000;

/** Food offers have no countdown and stay open until a rider takes one, so a rider
 * whose socket missed the "new_order" event (app in the background, a push tapped
 * later, a reconnect) can still see it. While online and free, this asks the
 * server for any open food offer: on mount, when the app comes back to the
 * foreground, and every 15 seconds. Rides keep their 15-second socket offers. */
export function useFoodOfferPoll() {
  const token = useDriverStore((s) => s.token);
  const isOnline = useDriverStore((s) => s.isOnline);
  const isFree = useDriverStore((s) => !s.incomingOrder && !s.currentOrder);
  const wantsFood = useDriverStore((s) => s.activeServices.includes("food"));

  const check = useCallback(async () => {
    if (!apiUrl || !token) return;
    try {
      const res = await fetch(`${apiUrl}/orders/driver/food-offer`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const { offer } = await res.json();
      const state = useDriverStore.getState();
      // Re-checked after the request: a socket offer or a job may have landed meanwhile.
      if (offer && !state.incomingOrder && !state.currentOrder) {
        state.setIncomingOrder(offer as Order);
      }
    } catch (err) {
      console.warn("Failed to check for an open food offer:", err);
    }
  }, [token]);

  useEffect(() => {
    if (!isOnline || !isFree || !wantsFood) return;
    check();
    const interval = setInterval(check, POLL_MS);
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") check();
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [isOnline, isFree, wantsFood, check]);
}
