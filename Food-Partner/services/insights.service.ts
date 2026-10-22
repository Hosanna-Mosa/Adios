import { customFetch } from "@/utils/api/custom-fetch";
import type { AnalyticsRange, OfferInput, PartnerOffer, SalesAnalytics } from "@/types/insights";
import { parseNumber } from "@/utils/number";

// Sales analytics, offers and invoice links for the signed-in outlet.

export const getSalesAnalytics = (days: AnalyticsRange) => customFetch<SalesAnalytics>(`/vendors/me/analytics?days=${days}`);

export const getMyOffers = () => customFetch<PartnerOffer[]>("/vendors/me/offers");

export const createOffer = (input: OfferInput) =>
  customFetch<PartnerOffer>("/vendors/me/offers", {
    method: "POST",
    body: JSON.stringify({
      code: input.code.trim().toUpperCase(),
      discountType: input.discountType,
      discountValue: parseNumber(input.discountValue),
      ...(input.discountType === "PERCENTAGE" && parseNumber(input.maxDiscount) ? { maxDiscount: parseNumber(input.maxDiscount) } : {}),
      minOrderValue: parseNumber(input.minOrderValue) ?? 0,
      // The offer runs through the end of its last day.
      ...(input.expiryDate ? { expiryDate: `${input.expiryDate}T23:59:59+05:30` } : {}),
    }),
  });

export const setOfferActive = (id: string, isActive: boolean) =>
  customFetch<PartnerOffer>(`/vendors/me/offers/${id}/active`, { method: "PUT", body: JSON.stringify({ isActive }) });

export const deleteOffer = (id: string) => customFetch(`/vendors/me/offers/${id}`, { method: "DELETE" });

/** A link that opens the order's invoice in the browser for 10 minutes. */
export const getInvoiceLink = (orderId: string) => customFetch<{ url: string }>(`/orders/${orderId}/invoice-link`, { method: "POST" });
