// Number parsing shared by the dish form, the bulk upload and the menu service.

/** "₹1,299.50" / " 299 " / 299 -> 1299.5 / 299 / 299. Empty or unparseable -> null. */
export function parseNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[₹,\s]/g, "").replace(/^rs\.?/i, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** True when the field was left empty (so an optional number is simply absent). */
export const isBlank = (value: unknown) => value === null || value === undefined || (typeof value === "string" && value.trim() === "");

/** Keeps only digits and one decimal point while typing a price. */
export const sanitizeDecimal = (value: string) => {
  const digits = value.replace(/[^0-9.]/g, "");
  const dot = digits.indexOf(".");
  return dot === -1 ? digits : digits.slice(0, dot + 1) + digits.slice(dot + 1).replace(/\./g, "");
};

/** Keeps only digits, e.g. an order count or a phone number. */
export const sanitizeInteger = (value: string) => value.replace(/[^0-9]/g, "");

/**
 * "X% off" for an offer price — the same rounding the backend uses for
 * discountPercent. null when there is no valid offer (absent, not below the price).
 */
export function discountPercent(price: number | null | undefined, offerPrice: number | null | undefined): number | null {
  if (!price || price <= 0 || offerPrice == null || !(offerPrice > 0) || offerPrice >= price) return null;
  return Math.round(((price - offerPrice) / price) * 100);
}
