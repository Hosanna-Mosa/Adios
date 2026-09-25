import { customFetch } from "@/utils/api/custom-fetch";
import { trackEvent } from "@/utils/analytics";

// Razorpay order creation/verification and coupon lookup. Paths, methods and
// bodies are unchanged from the call sites these replaced.

export const createPaymentOrder = <T = any>(amount: number) =>
  customFetch<T>("/payments/create-order", { method: "POST", body: JSON.stringify({ amount }) });

/** `body` is the Razorpay signature payload, echoed back for server-side check. */
export const verifyPayment = async <T = any>(body: unknown) => {
  const res = await customFetch<T>("/payments/verify", { method: "POST", body: JSON.stringify(body) });
  // Only reached once the server has verified the Razorpay signature and
  // created the order, so this is a real, paid purchase.
  const b = body as {
    razorpay_payment_id?: string;
    orderData?: { serviceType?: string; totals?: { total?: number; couponCode?: string } };
  };
  trackEvent("purchase", {
    transaction_id: b?.razorpay_payment_id,
    value: b?.orderData?.totals?.total,
    currency: "INR",
    coupon: b?.orderData?.totals?.couponCode,
    service_type: b?.orderData?.serviceType,
  });
  return res;
};

export const validateCoupon = <T = { code: string; discountAmount: number }>(body: {
  code: string;
  vendorId: unknown;
  subtotal: number;
}) => customFetch<T>("/coupons/validate", { method: "POST", body: JSON.stringify(body) });

/** `query` is an already-encoded, already-?-prefixed string. */
export const getApplicableCoupons = <T>(query: string) =>
  customFetch<T>(`/coupons/applicable${query}`);
