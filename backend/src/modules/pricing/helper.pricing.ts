/**
 * Helper (task) pricing. The one place a helper fare is worked out: the customer app shows
 * the quote from GET /orders/helper-quote, and createOrder / the online checkout / a price
 * raise all check the customer's offer against the same numbers.
 *
 * Pure: nothing here reads the database. Rates come from SystemConfig
 * `global_settings.value.helperRates` (admin → Helper pricing) over HELPER_RATE_DEFAULTS.
 */

export interface HelperRates {
  /** Flat charge per task, ₹. */
  baseFare: number;
  /** Per booked hour, ₹. */
  perHourRate: number;
  /** Per km between the task location and the drop-off, past `freeKm`, ₹. */
  perKmRate: number;
  freeKm: number;
  /** Flat platform fee, ₹. */
  platformFee: number;
  /** Added on top of the subtotal (base + time + distance + platform fee), %. */
  taxPercent: number;
  /** The lowest offer accepted, as a % of the fare. */
  minOfferPercent: number;
  /** The highest offer accepted, as a % of the fare (stops typos like ₹50000). */
  maxOfferPercent: number;
  /** A booking is between these many hours. */
  minHours: number;
  maxHours: number;
  /** A task nobody took is cancelled this many minutes after the search ran out. */
  expiryMinutes: number;
}

// The fare the customer app has always shown (₹40 + ₹80/h + ₹15/km past 2 km + ₹5, plus 5%),
// now worked out here instead of on the phone.
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

/** Admin-saved values over the defaults; anything missing or not a sane number keeps its default. */
export function resolveHelperRates(saved: any): HelperRates {
  const rates = { ...HELPER_RATE_DEFAULTS };
  if (!saved || typeof saved !== "object") return rates;
  for (const key of Object.keys(rates) as (keyof HelperRates)[]) {
    const value = Number(saved[key]);
    if (saved[key] !== undefined && saved[key] !== null && Number.isFinite(value) && value >= 0) {
      rates[key] = value;
    }
  }
  if (rates.maxHours < rates.minHours) rates.maxHours = rates.minHours;
  if (rates.maxOfferPercent < rates.minOfferPercent) rates.maxOfferPercent = rates.minOfferPercent;
  return rates;
}

export interface HelperQuote {
  hours: number;
  distanceKm: number;
  baseFare: number;
  timeFare: number;
  distanceFare: number;
  platformFee: number;
  tax: number;
  surgeMultiplier: number;
  /** What the task costs at these rates. */
  total: number;
  /** The range the app suggests the customer offers. */
  suggestedLow: number;
  suggestedHigh: number;
  /** An offer must be within these. */
  minOffer: number;
  maxOffer: number;
}

const roundTo5 = (value: number) => Math.round(value / 5) * 5;

/** Booked hours clamped into the allowed range; a missing or bad value counts as one hour. */
export function clampHelperHours(hours: unknown, rates: HelperRates): number {
  const value = Number(hours);
  const safe = Number.isFinite(value) && value > 0 ? value : 1;
  return Math.min(rates.maxHours, Math.max(rates.minHours, safe));
}

export function computeHelperQuote(
  input: { hours: unknown; distanceKm?: number; surgeMultiplier?: number },
  rates: HelperRates,
): HelperQuote {
  const hours = clampHelperHours(input.hours, rates);
  const distanceKm = Math.max(0, Number(input.distanceKm) || 0);
  const surge = Number(input.surgeMultiplier) > 0 ? Number(input.surgeMultiplier) : 1;

  const baseFare = rates.baseFare;
  const timeFare = Math.round(hours * rates.perHourRate);
  const distanceFare = Math.round(Math.max(0, distanceKm - rates.freeKm) * rates.perKmRate);
  const platformFee = rates.platformFee;
  const subtotal = Math.round((baseFare + timeFare + distanceFare) * surge) + platformFee;
  const tax = Math.round((subtotal * rates.taxPercent) / 100);
  const total = subtotal + tax;

  const minOffer = Math.max(1, Math.ceil((total * rates.minOfferPercent) / 100));
  const maxOffer = Math.max(minOffer, Math.floor((total * rates.maxOfferPercent) / 100));

  return {
    hours,
    distanceKm: Math.round(distanceKm * 10) / 10,
    baseFare,
    timeFare,
    distanceFare,
    platformFee,
    tax,
    surgeMultiplier: surge,
    total,
    suggestedLow: Math.max(minOffer, roundTo5(total * 0.85)),
    suggestedHigh: Math.min(maxOffer, roundTo5(total * 1.15)),
    minOffer,
    maxOffer,
  };
}

/** Straight-line distance in km — the same measure the quote screen uses. */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Task location → drop-off distance for a helper order's stops (0 with no drop-off). */
export function helperStopsDistanceKm(stops: any[]): number {
  if (!Array.isArray(stops) || stops.length < 2) return 0;
  const point = (s: any) => ({
    lat: Number(s?.latitude ?? s?.lat ?? s?.location?.coordinates?.[1]),
    lng: Number(s?.longitude ?? s?.lng ?? s?.location?.coordinates?.[0]),
  });
  const a = point(stops[0]);
  const b = point(stops[stops.length - 1]);
  if (![a.lat, a.lng, b.lat, b.lng].every(Number.isFinite)) return 0;
  return haversineKm(a.lat, a.lng, b.lat, b.lng);
}
