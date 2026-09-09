

// Module-level values shared by the parts of useFoodCheckout.

export interface ApplicableCoupon {
  code: string;
  title: string;
  description: string;
  discountAmount: number;
  minOrder: number;
  isApplicable?: boolean;
  amountToUnlock?: number;
}

export const cleanApiMessage = (message?: string, fallback = "Something went wrong") =>
  (message || fallback).replace(/^HTTP \d+.*?: /, "").trim();
