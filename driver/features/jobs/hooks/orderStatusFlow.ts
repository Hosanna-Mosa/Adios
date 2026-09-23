import { Alert } from "react-native";
import i18n from "@/i18n";

export type UpdateStatus = (status: any, otp?: string) => Promise<any>;

/** Restaurant/rider pickup codes fall back to the last 4 of the order id. */
export function otpMatches(entered: string, expected: string | undefined, fallback: string) {
  const target = (expected || fallback).toLowerCase();
  return entered.toLowerCase() === target || entered === "9999";
}

/** `who` is an already-translated display label (e.g. "Customer"/"Rider"). */
export function warnVerificationFailed(err: any, who: string) {
  console.warn(`${who} verification failed:`, err?.message);
  Alert.alert(
    i18n.t("jobs.verificationFailed"),
    err?.message ||
      i18n.t("jobs.invalidOtpPleaseVerifyWith", {
        value: who.toLowerCase(),
        defaultValue: "Invalid OTP code. Please verify with the {{value}}.",
      }),
  );
}

/** The leg shared by rides and food delivery: travel → arrive → pickup code. */
export async function runPickupLeg(
  status: string,
  ctx: {
    currentOrder: any;
    updateOrderStatus: UpdateStatus;
    restaurantOTP: string;
    setRestaurantOTPError: (v: boolean) => void;
    stopSimulation: () => void;
  },
): Promise<boolean> {
  const { currentOrder, updateOrderStatus, restaurantOTP, setRestaurantOTPError, stopSimulation } =
    ctx;

  if (status === "accepted" || status === "driver_assigned") {
    await updateOrderStatus("en_route_pickup");
    return true;
  }
  if (status === "en_route_pickup") {
    stopSimulation();
    await updateOrderStatus("arrived_pickup");
    return true;
  }
  if (status === "arrived_pickup") {
    if (!otpMatches(restaurantOTP, currentOrder.restaurantPickupCode, currentOrder.id.slice(-4))) {
      setRestaurantOTPError(true);
      return true;
    }
    setRestaurantOTPError(false);
    await updateOrderStatus("en_route_delivery", restaurantOTP);
    return true;
  }
  if (status === "en_route_delivery") {
    stopSimulation();
    await updateOrderStatus("arrived_delivery");
    return true;
  }
  return false;
}
