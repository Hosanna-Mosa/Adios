import { Alert } from "react-native";
import { router } from "expo-router";

import i18n from "@/i18n";
import type { GetDriverState, Order, SetDriverState } from "./types";

const RIDE_TYPES = ["bike", "auto", "cab", "cab_prime", "helper"];
const FOOD_TYPES = ["delivery", "helper"];

const sameId = (a: string, b: any) => a === b || a.toString() === b?.toString();

/** Wires the live order feed once the driver goes online. */
export function registerOrderSocketHandlers(
  socketService: any,
  set: SetDriverState,
  get: GetDriverState,
) {
  socketService.on("new_order", (data: any) => {
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

  socketService.on("order_offer_expired", (data: any) => {
    console.log("Order offer expired for current driver:", data);
    const orderId = data.orderId || data.id;
    const incoming = get().incomingOrder;
    if (incoming && (!orderId || sameId(incoming.id, orderId))) {
      set({ incomingOrder: null });
    }
  });

  socketService.on("order_cancelled", (data: any) => {
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

  socketService.on("upcoming_reserved_ride", (data: any) => {
    console.log("Upcoming reserved ride alert received:", data);
    Alert.alert(
      i18n.t("jobs.upcomingReservedRide"),
      i18n.t("jobs.scheduledRideStartsIn15Minutes", { value: data.customerName, defaultValue: "Your scheduled ride for {{value}} starts in 15 minutes! Please prepare to travel." }),
      [{ text: i18n.t("jobs.startTravel"), onPress: () => get().startReservedRide(data.orderId) }],
      { cancelable: false },
    );
  });
}
