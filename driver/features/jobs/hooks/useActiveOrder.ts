import { router } from "expo-router";
import { useCallback, useRef } from "react";

import { useDriverStore } from "@/store/driverStore";
import { findStops, getFoodItems, isHelperOrder, isRideOrder } from "../orderStops";
import { orderPayout } from "../orderEarnings";
import { useDriverTracking } from "./useDriverTracking";
import { useGpsSimulator } from "./useGpsSimulator";
import { useOrderActions } from "./useOrderActions";
import { useOrderTimers } from "./useOrderTimers";
import { useOrderVerification } from "./useOrderVerification";
import { useStatusTransition } from "./useStatusTransition";

export type ActiveOrderController = ReturnType<typeof useActiveOrder>;

/** Everything the active-order screen and its stage components need. */
export function useActiveOrder() {
  const { currentOrder, completeOrder, updateOrderStatus, unreadCount, driverPhone, token } =
    useDriverStore();

  const isHelper = isHelperOrder(currentOrder);
  const isRide = isRideOrder(currentOrder);
  const { pickupStop, deliveryStop } = findStops(currentOrder);
  const foodItems = getFoodItems(currentOrder);
  const status = currentOrder?.status?.toLowerCase() || "";

  const tracking = useDriverTracking(
    currentOrder,
    driverPhone,
    pickupStop,
    deliveryStop,
    useCallback(() => router.push("/(tabs)"), []),
  );

  // The simulator finishes a leg by advancing the status, but the transition
  // handler is built below it — go through a ref to break the cycle.
  const transitionRef = useRef<() => void>(() => {});

  const sim = useGpsSimulator({
    currentOrder,
    driverPhone,
    pickupStop,
    deliveryStop,
    driverLocation: tracking.driverLocation,
    driverHeading: tracking.driverHeading,
    setDriverLocation: tracking.setDriverLocation,
    setDriverHeading: tracking.setDriverHeading,
    mapRef: tracking.mapRef,
    onArrived: useCallback(() => transitionRef.current(), []),
  });

  const timers = useOrderTimers(status, isHelper);
  const verification = useOrderVerification();

  const handleStatusTransition = useStatusTransition({
    currentOrder,
    isHelper,
    isRide,
    foodItems,
    verification,
    updateOrderStatus,
    completeOrder,
    stopSimulation: sim.stopSimulation,
  });
  transitionRef.current = handleStatusTransition;

  const actions = useOrderActions(
    currentOrder,
    token,
    updateOrderStatus,
    pickupStop,
    deliveryStop,
  );

  const earnings = orderPayout(currentOrder);

  return {
    // The screen bails before rendering any stage when this is null.
    currentOrder: currentOrder!,
    unreadCount, status,
    isHelper, isRide, pickupStop, deliveryStop, foodItems,
    ...tracking,
    ...sim,
    ...timers,
    verification,
    ...actions,
    earnings,
    handleStatusTransition,
  };
}
