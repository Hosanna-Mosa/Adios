import type { TFunction } from "i18next";
import type { Offer } from "@/types/models";

// Pure helpers for the Offers page: grouping by restaurant and turning an
// offer's discount fields into the one-line text the card shows.

export interface OfferGroup {
  vendor: Offer["vendor"];
  offers: Offer[];
}

/** One group per restaurant, in the order the API ranked their first offer. */
export function groupOffersByVendor(offers: Offer[]): OfferGroup[] {
  const groups = new Map<string, OfferGroup>();
  for (const offer of offers) {
    const vendor = offer?.vendor;
    if (!vendor?._id) continue;
    const key = String(vendor._id);
    const group = groups.get(key);
    if (group) group.offers.push(offer);
    else groups.set(key, { vendor, offers: [offer] });
  }
  return Array.from(groups.values());
}

const rupees = (n: number) => `₹${Math.round(n)}`;

/** "50% OFF up to ₹120" · "₹100 OFF" (+ " above ₹299" when there is a minimum). */
export function formatOfferDiscount(offer: Offer, t: TFunction): string {
  const value = Number(offer.discountValue) || 0;
  const max = Number(offer.maxDiscount) || 0;
  const min = Number(offer.minOrderValue) || 0;

  const main = offer.discountType === "PERCENTAGE"
    ? max > 0
      ? t("app.offers.percentOffUpTo", { value, max: rupees(max) })
      : t("app.offers.percentOff", { value })
    : t("app.offers.flatOff", { value: rupees(value) });

  return min > 0 ? `${main} ${t("app.offers.aboveMin", { min: rupees(min) })}` : main;
}

/** "12 Oct" — the last day the offer runs, or null when it has no end date. */
export function formatOfferEndDate(endDate?: string): string | null {
  if (!endDate) return null;
  const d = new Date(endDate);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
