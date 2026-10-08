import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import i18n from "@/i18n";
import { ApiError } from "@/utils/api/custom-fetch";
import {
  createPaymentOrder,
  createTopupPayment,
  getCheckoutStatus,
  verifyPayment,
  type CreatePaymentOrderResponse,
} from "@/services/payments.service";
import { showPaymentOutcome } from "@/contexts/paymentOutcomeStore";

// Razorpay checkout in the phone's browser (Chrome Custom Tab on Android, an in-app Safari
// sheet on iOS). The backend hosts the page; Razorpay posts the result to the backend, which
// sends the browser back to flavour://payment-result. Every payment screen goes through this
// one helper (RAZORPAY_INTEGRATION.md §7). The app never decides that a payment succeeded:
// it hands the ids to /payments/verify, which checks them with Razorpay.

export type PaymentFlowErrorCode = "CANCELLED" | "FAILED";

export class PaymentFlowError extends Error {
  constructor(public readonly code: PaymentFlowErrorCode, message: string) {
    super(message);
    this.name = "PaymentFlowError";
  }
}

/** What /payments/verify needs. Without payment id + signature the server looks the payment up itself. */
export type CheckoutResult = {
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
};

export type CheckoutOptions = {
  /** From POST /payments/create-order. */
  checkoutUrl: string;
  returnUrl: string;
  order_id: string;
};

const param = (value: unknown) => (typeof value === "string" && value ? value : undefined);

export const RazorpayIntegration = {
  open: async ({ checkoutUrl, returnUrl, order_id }: CheckoutOptions): Promise<CheckoutResult> => {
    const result = await WebBrowser.openAuthSessionAsync(checkoutUrl, returnUrl);

    if (result.type === "success") {
      const query = Linking.parse(result.url).queryParams ?? {};
      if (query.status === "success") {
        return {
          razorpay_order_id: param(query.razorpay_order_id) ?? order_id,
          razorpay_payment_id: param(query.razorpay_payment_id),
          razorpay_signature: param(query.razorpay_signature),
        };
      }
      if (query.status === "failed") {
        throw new PaymentFlowError("FAILED", i18n.t("app.payment.failedHint"));
      }
    }

    // The browser was closed (or "Return to Flavour" tapped) without a success redirect.
    // The customer may still have paid — ask the server, which asks Razorpay.
    const { state } = await getCheckoutStatus(order_id);
    if (state === "paid" || state === "confirming") {
      return { razorpay_order_id: order_id };
    }
    throw new PaymentFlowError("CANCELLED", i18n.t("app.payment.cancelledHint"));
  },
};

/**
 * The whole online path for any service: start a checkout for `orderData` (the same body a
 * cash order posts to /orders), open Razorpay, and return the order the server placed once
 * the payment was confirmed. Throws PaymentFlowError / ApiError — see describePaymentError.
 */
export async function payOnlineAndPlaceOrder<T = any>(amount: number, orderData: unknown): Promise<T> {
  return checkoutAndVerify<T>(await createPaymentOrder(amount, orderData));
}

/**
 * Raises the price of a helper task that was paid online: the customer pays `amount` (the
 * difference) through the same browser checkout, and the server raises the offer once the
 * money is confirmed. Returns the updated order. A task that was taken or cancelled while
 * paying throws ApiError code TOPUP_REFUNDED (the money goes back automatically).
 */
export async function payOnlineTopup<T = any>(orderId: string, amount: number): Promise<T> {
  return checkoutAndVerify<T>(await createTopupPayment(orderId, amount));
}

/** Opens a checkout the server created and returns the order /payments/verify settles it into. */
async function checkoutAndVerify<T>(checkout: CreatePaymentOrderResponse): Promise<T> {
  let result: CheckoutResult;
  try {
    result = await RazorpayIntegration.open({
      checkoutUrl: checkout.checkoutUrl,
      returnUrl: checkout.returnUrl,
      order_id: checkout.id,
    });
  } catch (error) {
    // Back from the browser with a declined payment. A cancel stays quiet — no money moved.
    if (isDefinitePaymentFailure(error)) await showPaymentOutcome("failure");
    throw error;
  }
  // While the server is still placing the order (the checkout callback usually got there first
  // and holds the lock for a few seconds), verify answers 409 CONFIRMING. Keep asking briefly
  // instead of leaving the customer on the checkout screen with a paid order.
  for (let attempt = 1; ; attempt++) {
    try {
      const verified = await verifyPayment<{ order: T }>(result);
      // Not awaited: the caller moves on to the order while the animation plays over it.
      void showPaymentOutcome("success");
      return verified.order;
    } catch (error) {
      const code = error instanceof ApiError ? (error.data as { code?: string } | null)?.code : undefined;
      if (code !== "CONFIRMING" || attempt >= CONFIRM_ATTEMPTS) {
        // The animation finishes before the caller's explanatory alert opens on top of it.
        if (isDefinitePaymentFailure(error)) await showPaymentOutcome("failure");
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, CONFIRM_INTERVAL_MS));
    }
  }
}

/**
 * A payment the customer attempted and that did not go through — declined in
 * the checkout, or rejected by /payments/verify. Not a cancel, not a timeout
 * while the bank confirms, not a network error: those may still turn out paid.
 */
export function isDefinitePaymentFailure(error: unknown): boolean {
  if (error instanceof PaymentFlowError) return error.code === "FAILED";
  if (error instanceof ApiError) {
    const code = (error.data as { code?: string } | null)?.code;
    return code === "PAYMENT_NOT_COMPLETED" || code === "INVALID_PAYMENT" || code === "INVALID_SIGNATURE";
  }
  return false;
}

const CONFIRM_ATTEMPTS = 12;
const CONFIRM_INTERVAL_MS = 2500;

/** The translated alert for a payment problem, or null when the error isn't payment-specific. */
export function describePaymentError(error: unknown): { title: string; message: string } | null {
  if (error instanceof PaymentFlowError) {
    return error.code === "CANCELLED"
      ? { title: i18n.t("app.payment.cancelled"), message: error.message }
      : { title: i18n.t("app.food.paymentFailed"), message: error.message };
  }
  if (error instanceof ApiError) {
    const code = (error.data as { code?: string } | null)?.code;
    switch (code) {
      case "CONFIRMING":
        return { title: i18n.t("app.payment.confirming"), message: i18n.t("app.payment.confirmingHint") };
      case "PAYMENT_NOT_COMPLETED":
        return { title: i18n.t("app.food.paymentFailed"), message: i18n.t("app.payment.failedHint") };
      case "INVALID_PAYMENT":
      case "INVALID_SIGNATURE":
        return { title: i18n.t("app.food.paymentFailed"), message: i18n.t("app.payment.invalid") };
      case "TOPUP_REFUNDED":
        return { title: i18n.t("app.payment.topupRefundedTitle"), message: i18n.t("app.payment.topupRefunded") };
      case "PRICES_CHANGED":
        return { title: i18n.t("app.payment.pricesChangedTitle"), message: i18n.t("app.payment.pricesChanged") };
      case "RAZORPAY_UNAVAILABLE":
      case "AMOUNT_TOO_LOW":
      case "ORDER_DATA_MISSING":
        return { title: i18n.t("app.food.paymentFailed"), message: i18n.t("app.payment.couldNotStart") };
    }
  }
  return null;
}
