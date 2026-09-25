import { router } from "expo-router";

import i18n from "@/i18n";
import { API_URL as apiUrl } from "@/utils/apiUrl";
import { mapApiOrder } from "../orderMapper";
import type { DriverState, GetDriverState, Order, SetDriverState } from "../types";

const placeholderRide = (orderId: string): Order =>
  ({
    id: orderId,
    distance: i18n.t("jobs.notAvailableAbbr"),
    duration: i18n.t("jobs.notAvailableAbbr"),
    earnings: 0,
    status: "driver_assigned",
    customerName: i18n.t("jobs.customer"),
    customerPhone: i18n.t("jobs.notAvailableAbbr"),
    timestamp: new Date(),
    serviceType: "ride",
    stops: [],
  }) as Order;

export const createReservedRideSlice = (
  set: SetDriverState,
  get: GetDriverState,
): Pick<DriverState, "startReservedRide"> => ({
  startReservedRide: async (orderId: string) => {
    const { token } = get();
    let orderFromApi: any = null;
    if (token) {
      try {
        const res = await fetch(`${apiUrl}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) orderFromApi = await res.json();
      } catch (err) {
        console.error("Failed to fetch reserved order details on start travel:", err);
      }
    }

    set({
      currentOrder: orderFromApi ? mapApiOrder(orderFromApi) : placeholderRide(orderId),
      currentStep: 0,
      activeChat: [],
      unreadCount: 0,
    });

    router.push("/active-order");
  },
});
