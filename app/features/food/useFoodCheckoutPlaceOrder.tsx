import { Alert } from "react-native";
import { router } from "expo-router";
import { customFetch } from "@/utils/api/custom-fetch";
import { RazorpayIntegration } from "@/utils/razorpay";
import { buildPlaceOrder } from "./useFoodCheckoutPlaceOrder.handlers";

// Part 4 of useFoodCheckout, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useFoodCheckoutPlaceOrder(params: any, theme: any, getItemCount: any, vendorId: any, items: any, clearCart: any, user: any, token: any, setOrderId: any, setStatus: any, setServiceType: any, selectedAddress: any, setIsPlacingOrder: any, appliedPromo: any, vendorName: any, scheduledFor: any, setShowScheduleSheet: any, subtotal: any, deliveryFee: any, activeTip: any, discount: any, total: any, receiverName: any, receiverPhone: any, addressIssue: any) {
  const placeOrder = buildPlaceOrder(params, theme, getItemCount, vendorId, items, clearCart, user, token, setOrderId, setStatus, setServiceType, selectedAddress, setIsPlacingOrder, appliedPromo, vendorName, scheduledFor, setShowScheduleSheet, subtotal, deliveryFee, activeTip, discount, total, receiverName, receiverPhone, addressIssue);

  return { placeOrder };
}
