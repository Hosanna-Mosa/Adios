import { Alert } from "react-native";

import i18n from "@/i18n";
import { API_URL as apiUrl } from "@/utils/apiUrl";
import { trackEvent } from "@/utils/analytics";
import { mapApiOrder } from "../orderMapper";
import type { DriverState, GetDriverState, Order, SetDriverState } from "../types";

const MOCK_DRIVER = {
  id: "mock_driver_123",
  name: "Mock Driver",
  phone: "+1 (555) 987-6543",
  vehicle: "Mock Vehicle",
};

export const createOrderLifecycleSlice = (
  set: SetDriverState,
  get: GetDriverState,
): Pick<DriverState, "acceptOrder" | "rejectOrder" | "restoreActiveOrder"> => ({
  acceptOrder: async () => {
    const { incomingOrder, token } = get();
    if (!incomingOrder) return false;
    const isBroadcast = incomingOrder.dispatchMode === "broadcast";

    let accepted = false;
    let orderFromApi: any = null;
    if (token) {
      try {
        const res = await fetch(`${apiUrl}/orders/${incomingOrder.id}/accept`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          console.warn(error.message || "Failed to accept order via API");
          // A food offer goes to many riders at once, so losing it is normal:
          // say so and close the card rather than pretend the job is ours.
          if (isBroadcast) {
            set({ incomingOrder: null });
            Alert.alert(i18n.t("jobs.offerGoneTitle"), error.message || i18n.t("jobs.offerGoneMessage"));
            return false;
          }
        } else {
          accepted = true;
          orderFromApi = await res.json();
        }
      } catch (e) {
        console.error("Order acceptance API failed:", e);
        if (isBroadcast) {
          Alert.alert(i18n.t("jobs.offerAcceptFailedTitle"), i18n.t("jobs.offerAcceptFailedMessage"));
          return false;
        }
      }
    }

    if (!accepted) {
      // Fallback for unauthenticated testing or API failure
      import("../../utils/socketService").then(({ socketService }) => {
        socketService.emit("driver_accepted_order", {
          orderId: incomingOrder.id,
          driverInfo: MOCK_DRIVER,
        });
      });
    }

    if (accepted) {
      trackEvent("order_accepted", {
        service_type: incomingOrder.serviceType,
        value: incomingOrder.earnings,
        currency: "INR",
        reserved: !!incomingOrder.isReserved,
      });
    }

    if (incomingOrder.isReserved) {
      Alert.alert(
        i18n.t("jobs.rideReservedSuccessfully"),
        i18n.t("jobs.rideReservationAcceptedNotifyBeforePickup"),
        [{ text: i18n.t("actions.ok") }],
      );
      set({ currentOrder: null, incomingOrder: null, activeChat: [], unreadCount: 0 });
      return true;
    }

    set({
      currentOrder: orderFromApi
        ? mapApiOrder(orderFromApi, incomingOrder)
        : ({ ...incomingOrder, status: "accepted" } as Order),
      incomingOrder: null,
      currentStep: 0,
      activeChat: [],
      unreadCount: 0,
    });
    return true;
  },

  // The accepted job only lives in memory, so closing or reloading the app used to
  // lose it while the server still had this driver on it. The home screen asks for
  // it whenever it opens; a job already on screen is left alone.
  restoreActiveOrder: async () => {
    const { token, currentOrder } = get();
    if (!token || currentOrder) return;
    try {
      const res = await fetch(`${apiUrl}/orders/driver/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const { order } = await res.json();
      // Accepted or cleared while the request was out — keep that.
      if (!order || get().currentOrder || get().token !== token) return;
      set({ currentOrder: mapApiOrder(order), currentStep: 0 });
    } catch {
      // Offline: try again the next time home opens.
    }
  },

  rejectOrder: async (reason?: string) => {
    const { incomingOrder, token } = get();
    if (incomingOrder && token) {
      // The backend requires a non-empty reason (see orders.controller.ts)
      // and uses this call to end the dispatch offer early rather than let
      // the server's own ~16s per-driver timer run out — so a dismissal
      // with no reason (the countdown expiring, the back button, tapping
      // outside the sheet) still has to reach the server, or the dispatcher
      // sits waiting out the full timeout for no reason.
      const declineReason = reason || "Dismissed without reason";
      try {
        await fetch(`${apiUrl}/orders/${incomingOrder.id}/decline`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ reason: declineReason }),
        });
      } catch (e) {
        console.error("Failed to decline order", e);
      }
    }
    if (incomingOrder) {
      trackEvent("order_declined", { service_type: incomingOrder.serviceType, reason });
    }
    set({ incomingOrder: null });
  },
});
