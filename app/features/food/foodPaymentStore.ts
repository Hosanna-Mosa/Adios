import { create } from "zustand";

// The food order between checkout and the payment screen. Checkout validates and builds it
// when "Proceed to pay" is tapped; app/payment.tsx pays for exactly this, so the amount on
// the pay button is the amount the order carries.

export interface PendingFoodPayment {
  /** The /orders body (cash) or the payload sent with the Razorpay payment (online). */
  orderData: Record<string, unknown>;
  total: number;
  itemCount: number;
  vendorName: string;
  addressLabel: string;
  addressLine: string;
  /** ISO time of a scheduled delivery; null for "deliver now". */
  scheduledFor: string | null;
}

interface FoodPaymentState {
  /** In-memory only: rebuilt by checkout each time it hands over. */
  pending: PendingFoodPayment | null;
  setPending: (pending: PendingFoodPayment | null) => void;
}

export const useFoodPaymentStore = create<FoodPaymentState>((set) => ({
  pending: null,
  setPending: (pending) => set({ pending }),
}));
