import * as Linking from "expo-linking";
import i18n from "@/i18n";
import { customFetch } from "@/utils/api/custom-fetch";
import { trackEvent } from "@/utils/analytics";

// Razorpay checkout and coupon lookup.

export type CreatePaymentOrderResponse = {
  id: string; // Razorpay order id
  amount: number; // paise
  currency: string;
  key: string;
  name: string;
  checkoutUrl: string;
  returnUrl: string;
};

/**
 * Starts a checkout. `orderData` is what is being bought: the server stores it and places the
 * order itself once Razorpay confirms the money, even if the app is closed meanwhile.
 */
export const createPaymentOrder = <T = CreatePaymentOrderResponse>(amount: number, orderData?: unknown) =>
  customFetch<T>("/payments/create-order", {
    method: "POST",
    body: JSON.stringify({
      amount,
      orderData,
      // Where the browser checkout sends the customer back (flavour://payment-result in builds).
      returnUrl: Linking.createURL("payment-result"),
      language: i18n.language,
    }),
  });

/** `body` is what RazorpayIntegration.open resolved with; the server re-checks it with Razorpay. */
export const verifyPayment = <T = any>(body: unknown) =>
  customFetch<T>("/payments/verify", { method: "POST", body: JSON.stringify(body) });

/** Whether money arrived for a checkout whose browser was closed without a redirect. */
export const getCheckoutStatus = (razorpayOrderId: string) =>
  customFetch<{ state: "paid" | "confirming" | "unpaid"; orderId?: string }>(
    `/payments/checkout-status/${encodeURIComponent(razorpayOrderId)}`,
  );

export const validateCoupon = <T = { code: string; discountAmount: number }>(body: {
  code: string;
  vendorId: unknown;
  subtotal: number;
}) => customFetch<T>("/coupons/validate", { method: "POST", body: JSON.stringify(body) });

/** `query` is an already-encoded, already-?-prefixed string. */
export const getApplicableCoupons = <T>(query: string) =>
  customFetch<T>(`/coupons/applicable${query}`);
