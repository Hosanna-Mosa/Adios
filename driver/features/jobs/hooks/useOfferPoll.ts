import { useCallback } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "expo-router";
import i18n from "@/i18n";
import { usePolling } from "@/hooks/usePolling";
import { useDriverStore } from "@/store/driverStore";
import { isOfferHandled } from "@/store/offerTracker";
import { API_URL as apiUrl } from "@/utils/apiUrl";
import type { Order } from "@/store/types";

export const OFFER_POLL_MS = 3000;

const RIDE_TYPES = ["bike", "auto", "cab", "cab_prime", "helper"];
const FOOD_TYPES = ["delivery", "helper"];

const offerId = (o: any): string | null => (o ? String(o.id || o._id || "") || null : null);

function matchesActiveServices(offer: any, activeServices: string[]) {
  const type = String(offer?.serviceType || "").toLowerCase();
  return (
    (RIDE_TYPES.includes(type) && activeServices.includes("ride")) ||
    (FOOD_TYPES.includes(type) && activeServices.includes("food"))
  );
}

/** Asks the server for this driver's current offer (GET /orders/driver/offer)
 * every 3 s while online and not on a job, plus on focus and on return to the
 * foreground. Shows a new offer and clears one the server no longer holds
 * (expired, taken by another rider, cancelled). Returns a manual refresh. */
export function useOfferPoll() {
  const token = useDriverStore((s) => s.token);
  const isOnline = useDriverStore((s) => s.isOnline);
  const onJob = useDriverStore((s) => !!s.currentOrder);
  const active = isOnline && !onJob && !!token;

  const check = useCallback(async () => {
    const start = useDriverStore.getState();
    if (!apiUrl || !start.token || !start.isOnline || start.currentOrder) return;
    const shownAtStart = offerId(start.incomingOrder);
    try {
      const res = await fetch(`${apiUrl}/orders/driver/offer`, {
        headers: { Authorization: `Bearer ${start.token}` },
      });
      if (!res.ok) return;
      const { offer } = await res.json();

      const state = useDriverStore.getState();
      // Stale answer: the driver went offline, took a job or the card changed meanwhile.
      if (!state.isOnline || state.currentOrder || offerId(state.incomingOrder) !== shownAtStart) return;

      const id = offerId(offer);
      const shown = state.incomingOrder;
      if (shown) {
        // Accept/decline in flight, or still on offer: leave the card alone.
        if (isOfferHandled(shown.id) || id === String(shown.id)) return;
        useDriverStore.setState({ incomingOrder: null });
        // A food offer disappears because someone else took it (or it was cancelled);
        // say so. A sequential offer just expired, so it closes silently.
        const supersededBySequential = offer && offer.dispatchMode !== "broadcast";
        if (shown.dispatchMode === "broadcast" && !supersededBySequential) {
          Alert.alert(i18n.t("jobs.offerGoneTitle"), i18n.t("jobs.offerGoneMessage"));
        }
      }

      if (!offer || !id || isOfferHandled(id)) return;
      if (!matchesActiveServices(offer, state.activeServices || [])) return;
      state.setIncomingOrder({ ...offer, id } as Order);
    } catch (err) {
      console.warn("Failed to check for an order offer:", err);
    }
  }, []);

  const { run, refresh, refreshing } = usePolling(check, OFFER_POLL_MS, active);

  useFocusEffect(
    useCallback(() => {
      if (active) run();
    }, [active, run]),
  );

  return { refresh, refreshing };
}
