import { Alert } from "react-native";

import i18n from "@/i18n";
import { API_URL as apiUrl } from "@/utils/apiUrl";
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
): Pick<DriverState, "acceptOrder" | "rejectOrder"> => ({
  acceptOrder: async () => {
    const { incomingOrder, token } = get();
    if (!incomingOrder) return;

    let accepted = false;
    let orderFromApi: any = null;
    if (token) {
      try {
        const res = await fetch(`${apiUrl}/orders/${incomingOrder.id}/accept`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const error = await res.json();
          console.warn(error.message || "Failed to accept order via API");
        } else {
          accepted = true;
          orderFromApi = await res.json();
        }
      } catch (e) {
        console.error("Order acceptance API failed:", e);
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

    if (incomingOrder.isReserved) {
      Alert.alert(
        i18n.t("jobs.rideReservedSuccessfully"),
        i18n.t("jobs.rideReservationAcceptedNotifyBeforePickup"),
        [{ text: i18n.t("actions.ok") }],
      );
      set({ currentOrder: null, incomingOrder: null, activeChat: [], unreadCount: 0 });
      return;
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
  },

  rejectOrder: async (reason?: string) => {
    const { incomingOrder, token } = get();
    if (incomingOrder && token && reason) {
      try {
        await fetch(`${apiUrl}/orders/${incomingOrder.id}/decline`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ reason }),
        });
      } catch (e) {
        console.error("Failed to decline order", e);
      }
    }
    set({ incomingOrder: null });
  },
});
