import React, { useEffect } from "react";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { PaymentReturningBody } from "@/features/food/components/PaymentReturningBody";
import { useAuthStore } from "@/contexts/authStore";
import { verifyPayment } from "@/services/payments.service";
import { showPaymentOutcome } from "@/contexts/paymentOutcomeStore";
import { isDefinitePaymentFailure } from "@/utils/razorpay";

// Target of flavour://payment-result, where the browser checkout sends the customer back.
// Normally RazorpayIntegration.open (utils/razorpay.ts) is already waiting for this link and
// finishes the payment, so this screen only steps out of the way. If Android closed the app
// while the customer was paying, the link starts the app here instead: confirm the payment
// (the server has already placed the order) and show My orders.

export default function PaymentResultScreen() {
  const params = useLocalSearchParams<{
    status?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  }>();

  const isInitialized = useAuthStore((s) => s.isInitialized);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    // Cold start: wait until the saved session is restored (the root layout sends a
    // signed-out user to login by itself).
    if (!isInitialized || !token) return;
    if (params.status !== "success" || !params.razorpay_order_id) {
      if (params.status === "failed") void showPaymentOutcome("failure");
      router.replace("/");
      return;
    }
    verifyPayment({
      razorpay_order_id: params.razorpay_order_id,
      ...(params.razorpay_payment_id && params.razorpay_signature
        ? { razorpay_payment_id: params.razorpay_payment_id, razorpay_signature: params.razorpay_signature }
        : {}),
    })
      .then(() => void showPaymentOutcome("success"))
      .catch((error) => {
        console.warn("Payment confirmation after restart failed", error);
        if (isDefinitePaymentFailure(error)) void showPaymentOutcome("failure");
      })
      .finally(() => router.replace("/(tabs)/orders"));
    // Runs for the link that opened this screen, once the session is known.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, token]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false, animation: "none" }} />
      <PaymentReturningBody />
    </>
  );
}
