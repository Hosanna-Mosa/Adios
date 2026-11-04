// Dish offer pricing shared by the price display (components/shared/DishPrice)
// and the cart (contexts/cartStore), so what the customer sees is exactly what
// the cart charges.

interface Priced {
  price?: number | string | null;
  offerPrice?: number | string | null;
  discountPercent?: number | null;
}

/** The offer price when it is a valid number above 0 and below the price, else null. */
export function validOfferPrice(item: Priced | null | undefined): number | null {
  if (!item) return null;
  const price = Number(item.price);
  if (item.offerPrice === null || item.offerPrice === undefined || item.offerPrice === "") return null;
  const offer = Number(item.offerPrice);
  if (!Number.isFinite(price) || !Number.isFinite(offer)) return null;
  return offer > 0 && offer < price ? offer : null;
}

/** What one unit actually costs: offerPrice ?? price. */
export function effectivePrice(item: Priced | null | undefined): number {
  const offer = validOfferPrice(item);
  return offer ?? (Number(item?.price) || 0);
}

/** Server-sent discountPercent when present, else round((price - offer) / price * 100). */
export function discountPercentOf(item: Priced | null | undefined): number | null {
  const offer = validOfferPrice(item);
  if (offer == null) return null;
  const sent = Number(item?.discountPercent);
  if (Number.isFinite(sent) && sent > 0) return Math.round(sent);
  const price = Number(item?.price);
  return Math.round(((price - offer) / price) * 100);
}

/**
 * en-IN digit grouping (lakhs/crores, e.g. 1,23,456), rounded to at most 2
 * decimals with no trailing zeros. Hand-rolled rather than
 * `Intl.NumberFormat("en-IN")` because Hermes on this build has no ICU data
 * for locale-aware number formatting — see useHome.shared.ts's date
 * formatter, which avoids `Intl` for the same reason.
 */
export function formatINR(amount: number | string | null | undefined): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "0";
  const rounded = Math.round(n * 100) / 100;
  const [intPart, decPart] = Math.abs(rounded).toFixed(2).split(".");
  const trimmedDec = decPart === "00" ? "" : `.${decPart.replace(/0$/, "")}`;
  const lastThree = intPart.slice(-3);
  const rest = intPart.slice(0, -3);
  const grouped = rest
    ? `${rest.replace(/(\d)(?=(\d{2})+$)/g, "$1,")},${lastThree}`
    : lastThree;
  return `${rounded < 0 ? "-" : ""}${grouped}${trimmedDec}`;
}
