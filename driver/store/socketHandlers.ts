import { Alert } from "react-native";
import { router } from "expo-router";

import i18n from "@/i18n";
import type { GetDriverState, Order, SetDriverState } from "./types";

const RIDE_TYPES = ["bike", "auto", "cab", "cab_prime", "helper"];
const FOOD_TYPES = ["delivery", "helper"];

const sameId = (a: string, b: any) => a === b || a.toString() === b?.toString();

// Handlers currently attached, so a re-register can detach them first.
let boundHandlers: Record<string, (data: any) => void> = {};

/** Wires the live order feed once the driver goes online.
 *
 * goOnline calls this every time (it also re-joins the dispatch room), but the
 * listeners must not stack: going offline and back on, or restoring a shift on
 * launch, used to leave two handlers per event and pop the incoming-order modal
 * twice for one order. So any handlers from a previous call are detached
 * first. (A plain "bind once" flag isn't enough here — disconnect() discards
 * the socket, and a fresh socket would then never get its listeners.) */
export function registerOrderSocketHandlers(
  socketService: any,
  set: SetDriverState,
  get: GetDriverState,
) {
  for (const [event, handler] of Object.entries(boundHandlers)) {
    socketService.off(event, handler);
  }
  boundHandlers = {};
  const on = (event: string, handler: (data: any) => void) => {
    boundHandlers[event] = handler;
    socketService.on(event, handler);
  };

  on("new_order", (data: any) => {
    console.log("New order received:", data);
    const serviceType = data.serviceType?.toLowerCase();
    const activeServices = get().activeServices || [];

    console.log(
      "SOCKET RECEIVED",
      `type: ${serviceType}, active: ${JSON.stringify(activeServices)}`,
    );

    const matchesActiveServices =
      (RIDE_TYPES.includes(serviceType) && activeServices.includes("ride")) ||
      (FOOD_TYPES.includes(serviceType) && activeServices.includes("food"));

    if (matchesActiveServices) {
      get().setIncomingOrder(data as Order);
    } else {
      console.log(
        `Filtering out incoming order ${data.id || data._id} of type ${serviceType}. Active services:`,
        activeServices,
      );
      console.log("FILTERED OUT", `matchesActiveServices is false`);
    }
  });

  on("order_offer_expired", (data: any) => {
    console.log("Order offer expired for current driver:", data);
    const orderId = data.orderId || data.id;
    const incoming = get().incomingOrder;
    if (incoming && (!orderId || sameId(incoming.id, orderId))) {
      set({ incomingOrder: null });
    }
  });

  on("order_cancelled", (data: any) => {
    console.log("Order cancelled received:", data);
    const orderId = data.orderId || data.id;
    if (!orderId) return;

    const incoming = get().incomingOrder;
    if (incoming && sameId(incoming.id, orderId)) {
      set({ incomingOrder: null });
      Alert.alert(i18n.t("jobs.orderCancelled"), i18n.t("jobs.incomingOrderCancelledByCustomer"));
    }

    const current = get().currentOrder;
    if (current && sameId(current.id, orderId)) {
      set({ currentOrder: null, currentStep: 0 });
      Alert.alert(i18n.t("jobs.orderCancelled"), i18n.t("jobs.activeOrderCancelledByCustomer"));
      router.push("/(tabs)");
    }
  });

  on("upcoming_reserved_ride", (data: any) => {
    console.log("Upcoming reserved ride alert received:", data);
    Alert.alert(
      i18n.t("jobs.upcomingReservedRide"),
      i18n.t("jobs.scheduledRideStartsIn15Minutes", { value: data.customerName, defaultValue: "Your scheduled ride for {{value}} starts in 15 minutes! Please prepare to travel." }),
      [{ text: i18n.t("jobs.startTravel"), onPress: () => get().startReservedRide(data.orderId) }],
      { cancelable: false },
    );
  });
}
