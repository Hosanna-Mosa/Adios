import { router } from "expo-router";
import { useCallback } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";

import {
  otpMatches,
  runPickupLeg,
  warnVerificationFailed,
  type UpdateStatus,
} from "./orderStatusFlow";
import type { OrderVerification } from "./useOrderVerification";
import { paymentFields } from "@/store/orderMapper";

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
  const { t } = useTranslation();
  const {
    currentOrder, isHelper, isRide, foodItems, verification,
    updateOrderStatus, completeOrder, stopSimulation,
  } = args;

  const finish = useCallback(() => {
    completeOrder?.();
    router.push("/(tabs)");
  }, [completeOrder]);

  /** Cash orders can't be completed until the backend has recorded the cash (it checks too). */
  const cashStillToCollect = useCallback(() => {
    const payment = paymentFields(currentOrder);
    if (payment.paymentMethod !== "cash" || payment.cashCollected) return false;
    Alert.alert(
      t("jobs.collectCashFirstTitle"),
      t("jobs.collectCashFirst", { amount: payment.payableAmount }),
    );
    return true;
  }, [currentOrder, t]);

  const confirmDelivery = useCallback(async (who: string) => {
    if (cashStillToCollect()) return;
    try {
      await updateOrderStatus("delivered", verification.customerOTP);
      verification.setCustomerOTPError(false);
    } catch (err: any) {
      verification.setCustomerOTPError(true);
      warnVerificationFailed(err, who);
    }
  }, [updateOrderStatus, verification, cashStillToCollect]);

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
    if (cashStillToCollect()) return;
    try {
      await updateOrderStatus("delivered", verification.customerOTP);
    } catch (err: any) {
      verification.setCustomerOTPError(true);
      warnVerificationFailed(err, t("jobs.customer"));
    }
  }, [currentOrder, verification, updateOrderStatus, finish, t, cashStillToCollect]);

  /** Food delivery has an extra "picking_items" checklist gate. */
  const runPickingItems = useCallback(async () => {
    const allItemsChecked = foodItems.every((item: any) => verification.checkedItems[item.name]);
    if (!allItemsChecked) {
      Alert.alert(t("jobs.checklistIncomplete"), t("jobs.pleaseVerifyAndCheckOffAllItems"));
      return;
    }
    if (!verification.sealedChecked) {
      Alert.alert(t("jobs.tamperProofSealCheck"), t("jobs.pleaseVerifyAndCheckSealedPackaging"));
      return;
    }
    if (!verification.countChecked) {
      Alert.alert(t("jobs.itemCountCheck"), t("jobs.pleaseVerifyAndCheckItemCount"));
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
  }, [foodItems, verification, currentOrder, updateOrderStatus, t]);

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
      await confirmDelivery(isRide ? t("jobs.rider") : t("jobs.customer"));
      return;
    }
    if (status === "delivered") finish();
  }, [
    currentOrder, isHelper, isRide, verification, updateOrderStatus,
    stopSimulation, runHelper, runPickingItems, confirmDelivery, finish, t,
  ]);
}
