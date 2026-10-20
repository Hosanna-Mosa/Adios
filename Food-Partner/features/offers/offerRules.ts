import type { OfferInput, PartnerOffer } from "@/types/insights";
import { parseNumber } from "@/utils/number";

// Limits the server enforces too (backend vendor-offers.controller.ts) — checked here so the partner
// sees the problem before sending.
export const MAX_PERCENT = 50;
export const MAX_FLAT = 500;

export const EMPTY_OFFER: OfferInput = { code: "", discountType: "PERCENTAGE", discountValue: "", maxDiscount: "", minOrderValue: "", expiryDate: "" };

export type OfferErrors = Partial<Record<"code" | "discountValue" | "minOrderValue" | "expiryDate", string>>;

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Error keys (under "offers.") for each invalid field; empty when the offer is fine. */
export function validateOffer(input: OfferInput, today: Date = new Date()): OfferErrors {
  const errors: OfferErrors = {};
  if (!/^[A-Za-z0-9]{3,20}$/.test(input.code.trim())) errors.code = "codeInvalid";

  const value = parseNumber(input.discountValue);
  const limit = input.discountType === "PERCENTAGE" ? MAX_PERCENT : MAX_FLAT;
  if (value == null || value < 1 || value > limit) errors.discountValue = input.discountType === "PERCENTAGE" ? "percentInvalid" : "flatInvalid";

  const min = parseNumber(input.minOrderValue);
  if (input.minOrderValue.trim() && min == null) errors.minOrderValue = "minInvalid";
  else if (input.discountType === "FLAT" && value != null && (min ?? 0) < value) errors.minOrderValue = "minBelowDiscount";

  if (input.expiryDate.trim()) {
    const parsed = DATE.test(input.expiryDate.trim()) ? new Date(`${input.expiryDate.trim()}T23:59:59+05:30`) : null;
    if (!parsed || Number.isNaN(parsed.getTime()) || parsed.getTime() <= today.getTime()) errors.expiryDate = "expiryInvalid";
  }
  return errors;
}

/** "20% off up to ₹100" / "₹50 off" — what the customer sees, in short. */
export function offerSummary(offer: PartnerOffer, rupees: (n: number) => string): string {
  if (offer.discountType === "FLAT") return `${rupees(offer.discountValue)} off`;
  return offer.maxDiscount ? `${offer.discountValue}% off up to ${rupees(offer.maxDiscount)}` : `${offer.discountValue}% off`;
}

export const isExpired = (offer: PartnerOffer, now: Date = new Date()) => !!offer.expiryDate && new Date(offer.expiryDate).getTime() <= now.getTime();
