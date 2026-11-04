/** Helper-task pricing, as returned in `helperRates` by GET /admin/config. */
export interface HelperRates {
  baseFare: number;
  perHourRate: number;
  perKmRate: number;
  freeKm: number;
  platformFee: number;
  taxPercent: number;
  minOfferPercent: number;
  maxOfferPercent: number;
  minHours: number;
  maxHours: number;
  expiryMinutes: number;
}

export type HelperRateKey = keyof HelperRates;

/** The form keeps raw input strings so a half-typed value ("1.") isn't clobbered. */
export type HelperRatesForm = Record<HelperRateKey, string>;

export interface SystemConfigResponse {
  helperRates: HelperRates;
}

/** Same defaults as the backend's HELPER_RATE_DEFAULTS (used until the config loads). */
export const HELPER_RATE_DEFAULTS: HelperRates = {
  baseFare: 40,
  perHourRate: 80,
  perKmRate: 15,
  freeKm: 2,
  platformFee: 5,
  taxPercent: 5,
  minOfferPercent: 85,
  maxOfferPercent: 300,
  minHours: 0.5,
  maxHours: 12,
  expiryMinutes: 10,
};

export interface HelperRateLimit {
  min: number;
  max: number;
  step: number;
  integer?: boolean;
}

/** Mirrors updateSystemConfigSchema.helperRates in backend/src/modules/admin/admin.validation.ts. */
export const HELPER_RATE_LIMITS: Record<HelperRateKey, HelperRateLimit> = {
  baseFare: { min: 0, max: 10000, step: 1 },
  perHourRate: { min: 0, max: 10000, step: 1 },
  perKmRate: { min: 0, max: 1000, step: 0.5 },
  freeKm: { min: 0, max: 100, step: 0.5 },
  platformFee: { min: 0, max: 1000, step: 1 },
  taxPercent: { min: 0, max: 50, step: 0.5 },
  minOfferPercent: { min: 10, max: 100, step: 1 },
  maxOfferPercent: { min: 100, max: 1000, step: 1 },
  minHours: { min: 0.25, max: 24, step: 0.25 },
  maxHours: { min: 0.25, max: 24, step: 0.25 },
  expiryMinutes: { min: 1, max: 240, step: 1, integer: true },
};

export const HELPER_RATE_GROUPS: { id: "fare" | "offers" | "booking" | "search"; fields: HelperRateKey[] }[] = [
  { id: "fare", fields: ["baseFare", "perHourRate", "perKmRate", "freeKm", "platformFee", "taxPercent"] },
  { id: "offers", fields: ["minOfferPercent", "maxOfferPercent"] },
  { id: "booking", fields: ["minHours", "maxHours"] },
  { id: "search", fields: ["expiryMinutes"] },
];

/** The trip the "Example fare" preview prices. */
export const EXAMPLE_TRIP = { hours: 2, distanceKm: 5, surge: 1 };

export interface HelperFareBreakdown {
  hours: number;
  baseFare: number;
  timeFare: number;
  distanceFare: number;
  platformFee: number;
  subtotal: number;
  tax: number;
  total: number;
  minOffer: number;
  maxOffer: number;
}

/**
 * Same arithmetic as computeHelperQuote in backend/src/modules/pricing/helper.pricing.ts:
 * round((base + hours×perHour + max(0, km−freeKm)×perKm) × surge) + platformFee, then + tax%.
 */
export function computeHelperFare(
  rates: HelperRates,
  trip: { hours: number; distanceKm: number; surge: number } = EXAMPLE_TRIP,
): HelperFareBreakdown {
  const hours = Math.min(rates.maxHours, Math.max(rates.minHours, trip.hours));
  const timeFare = Math.round(hours * rates.perHourRate);
  const distanceFare = Math.round(Math.max(0, trip.distanceKm - rates.freeKm) * rates.perKmRate);
  const subtotal = Math.round((rates.baseFare + timeFare + distanceFare) * trip.surge) + rates.platformFee;
  const tax = Math.round((subtotal * rates.taxPercent) / 100);
  const total = subtotal + tax;
  const minOffer = Math.max(1, Math.ceil((total * rates.minOfferPercent) / 100));
  const maxOffer = Math.max(minOffer, Math.floor((total * rates.maxOfferPercent) / 100));
  return {
    hours,
    baseFare: rates.baseFare,
    timeFare,
    distanceFare,
    platformFee: rates.platformFee,
    subtotal,
    tax,
    total,
    minOffer,
    maxOffer,
  };
}
