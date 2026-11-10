import { readOrderLines } from "./useOrders.shared";

// What the past-order card and the Order Details screen read out of an order.

export interface OrderLine {
  name: string;
  quantity: number;
  isVeg: boolean;
  /** "Tub (320 Grams)" style detail line, when the dish has a unit or weight. */
  sub: string;
  /** Price of the whole line (unit price x quantity); 0 when the order did not record it. */
  amount: number;
  note: string;
}

export function orderLines(order: any): OrderLine[] {
  return readOrderLines(order)
    .map((l: any) => {
      const quantity = Math.max(1, Math.round(Number(l?.quantity) || 1));
      const unit = Number(l?.price) || 0;
      return {
        name: String(l?.name || "").trim(),
        quantity,
        isVeg: l?.isVeg !== false,
        sub: String(l?.unit || l?.weight || "").trim(),
        amount: Number(l?.total) || unit * quantity,
        note: String(l?.cookingRequest || "").trim(),
      };
    })
    .filter((l: OrderLine) => !!l.name);
}

export interface OrderTotals {
  subtotal: number;
  taxes: number;
  deliveryFee: number;
  serviceFee: number;
  tip: number;
  discount: number;
  total: number;
}

/** The bill the customer was shown, as stored with the order's drop stop. */
export function orderTotals(order: any): OrderTotals {
  const stops = Array.isArray(order?.stops) ? order.stops : [];
  const holder = stops.find((s: any) => s?.items?.totals) ?? stops[stops.length - 1];
  const raw = holder?.items?.totals ?? {};
  const total = Number(raw.total) || Number(order?.totalPrice) || 0;
  return {
    subtotal: Number(raw.subtotal) || 0,
    taxes: Number(raw.taxes) || 0,
    deliveryFee: Number(raw.deliveryFee) || 0,
    serviceFee: Number(raw.serviceFee) || 0,
    tip: Number(raw.tip) || 0,
    discount: Number(raw.discount) || Number(order?.discountAmount) || 0,
    total,
  };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function clock(d: Date, spaced: boolean) {
  const h = d.getHours();
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(d.getMinutes()).padStart(2, "0")}${spaced ? " " : ""}${h >= 12 ? "PM" : "AM"}`;
}

/** "25 Aug, 10:14PM" */
export function placedAt(value: any): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${clock(d, false)}`;
}

/** "August 25, 2026 at 10:14 PM" */
export function paidOn(value: any): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${MONTHS_LONG[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} at ${clock(d, true)}`;
}

export const rupees = (n: number) => `₹${n.toFixed(2)}`;

export function vendorOf(order: any): { id: string; name: string; address: string; image?: string; phone?: string; fssai?: string } {
  const v = order?.vendor && typeof order.vendor === "object" ? order.vendor : null;
  return {
    id: String(v?._id ?? order?.vendor ?? ""),
    name: String(v?.name ?? ""),
    address: String(v?.address ?? ""),
    image: v?.image,
    phone: v?.phone,
    fssai: v?.legal?.fssaiNumber,
  };
}

/** The star rating the customer gave, when the order carries it. */
export function ratingOf(order: any): number | null {
  const r = Number(order?.review?.rating ?? order?.reviewRating ?? order?.rating);
  return Number.isFinite(r) && r > 0 ? r : null;
}
