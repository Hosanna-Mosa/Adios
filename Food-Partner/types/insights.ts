// Sales analytics, offers and invoices — backend/src/modules/vendors (vendor-analytics*, vendor-offers).

export interface DayPoint {
  /** YYYY-MM-DD in India time. */
  date: string;
  orders: number;
  sales: number;
}

/** GET /vendors/me/analytics?days=… */
export interface SalesAnalytics {
  periodDays: number;
  /** True when the outlet had more orders than the report reads; the figures are then a floor. */
  truncated: boolean;
  days: DayPoint[];
  totals: { orders: number; sales: number; avgOrderValue: number; cancelled: number; placed: number; cancellationRate: number };
  topItems: { name: string; quantity: number; sales: number }[];
}

export type AnalyticsRange = 7 | 30 | 90;

/** One of the partner's own offers (a coupon scoped to the outlet). */
export interface PartnerOffer {
  _id: string;
  code: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  maxDiscount?: number;
  minOrderValue?: number;
  expiryDate?: string;
  title?: string;
  isActive: boolean;
  /** How many orders have used it. */
  usageCount: number;
}

/** The offer form's fields — numbers stay strings while they are typed. */
export interface OfferInput {
  code: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: string;
  maxDiscount: string;
  minOrderValue: string;
  /** YYYY-MM-DD, or empty for no expiry. */
  expiryDate: string;
}
