import { router } from "expo-router";
import { useCallback } from "react";
import { Alert } from "react-native";

import {
  otpMatches,
  runPickupLeg,
  warnVerificationFailed,
  type UpdateStatus,
} from "./orderStatusFlow";
import type { OrderVerification } from "./useOrderVerification";

type Args = {
  currentOrder: any;
  isHelper: boolean;
  isRide: boolean;
  foodItems: any[];
  verification: OrderVerification;
  updateOrderStatus: UpdateStatus;
  completeOrder?: () => void;
  stopSimulation: () => void;
};

/** Advances the order one stage, running whatever check that stage requires. */
export function useStatusTransition(args: Args) {
  const {
    currentOrder, isHelper, isRide, foodItems, verification,
    updateOrderStatus, completeOrder, stopSimulation,
  } = args;

  const finish = useCallback(() => {
    completeOrder?.();
    router.push("/(tabs)");
  }, [completeOrder]);

  const confirmDelivery = useCallback(async (who: string) => {
    try {
      await updateOrderStatus("delivered", verification.customerOTP);
      verification.setCustomerOTPError(false);
    } catch (err: any) {
      verification.setCustomerOTPError(true);
      warnVerificationFailed(err, who);
    }
  }, [updateOrderStatus, verification]);

  const runHelper = useCallback(async (status: string) => {
    if (status === "delivered" || status === "completed") {
      finish();
      return;
    }
    if (
      !otpMatches(verification.customerOTP, currentOrder.deliveryOtp, currentOrder.id.slice(-4))
    ) {
      verification.setCustomerOTPError(true);
      return;
    }
    verification.setCustomerOTPError(false);
    try {
      await updateOrderStatus("delivered", verification.customerOTP);
    } catch (err: any) {
      verification.setCustomerOTPError(true);
      warnVerificationFailed(err, "Customer");
    }
  }, [currentOrder, verification, updateOrderStatus, finish]);

  /** Food delivery has an extra "picking_items" checklist gate. */
  const runPickingItems = useCallback(async () => {
    const allItemsChecked = foodItems.every((item: any) => verification.checkedItems[item.name]);
    if (!allItemsChecked) {
      Alert.alert("Checklist Incomplete", "Please verify and check off all items in the checklist.");
      return;
    }
    if (!verification.sealedChecked) {
      Alert.alert("Tamper-proof Seal Check", "Please verify and check the sealed packaging box.");
      return;
    }
    if (!verification.countChecked) {
      Alert.alert("Item Count Check", "Please verify and check the item count box.");
      return;
    }
    if (
      !otpMatches(
        verification.restaurantOTP,
        currentOrder.restaurantPickupCode,
        currentOrder.id.slice(-4),
      )
    ) {
      verification.setRestaurantOTPError(true);
      return;
    }
    verification.setRestaurantOTPError(false);
    await updateOrderStatus("en_route_delivery", verification.restaurantOTP);
  }, [foodItems, verification, currentOrder, updateOrderStatus]);

  return useCallback(async () => {
    const status = currentOrder?.status?.toLowerCase() || "";

    if (isHelper) {
      await runHelper(status);
      return;
    }

    const handled = await runPickupLeg(status, {
      currentOrder,
      updateOrderStatus,
      restaurantOTP: verification.restaurantOTP,
      setRestaurantOTPError: verification.setRestaurantOTPError,
      stopSimulation,
    });
    if (handled) return;

    if (!isRide && status === "picking_items") {
      await runPickingItems();
      return;
    }
    if (status === "arrived_delivery") {
      await confirmDelivery(isRide ? "Rider" : "Customer");
      return;
    }
    if (status === "delivered") finish();
  }, [
    currentOrder, isHelper, isRide, verification, updateOrderStatus,
    stopSimulation, runHelper, runPickingItems, confirmDelivery, finish,
  ]);
}
