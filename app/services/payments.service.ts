import { customFetch } from "@/utils/api/custom-fetch";

// Razorpay order creation/verification and coupon lookup. Paths, methods and
// bodies are unchanged from the call sites these replaced.

export const createPaymentOrder = <T = any>(amount: number) =>
  customFetch<T>("/payments/create-order", { method: "POST", body: JSON.stringify({ amount }) });

/** `body` is the Razorpay signature payload, echoed back for server-side check. */
export const verifyPayment = <T = any>(body: unknown) =>
  customFetch<T>("/payments/verify", { method: "POST", body: JSON.stringify(body) });

export const validateCoupon = <T = { code: string; discountAmount: number }>(body: {
  code: string;
  vendorId: unknown;
  subtotal: number;
}) => customFetch<T>("/coupons/validate", { method: "POST", body: JSON.stringify(body) });

/** `query` is an already-encoded, already-?-prefixed string. */
export const getApplicableCoupons = <T>(query: string) =>
  customFetch<T>(`/coupons/applicable${query}`);
