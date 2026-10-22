// Sales analytics for one outlet, worked out from its orders. A pure function over plain order
// objects, so the numbers can be unit-tested without a database; vendor-analytics.controller.ts
// feeds it the outlet's orders for the chosen period.

export interface AnalyticsOrder {
  createdAt: Date | string;
  status?: string;
  /** The items subtotal — the outlet's gross, the same figure its payout balance is built from. */
  priceBreakdown?: { baseFare?: number };
  stops?: { items?: unknown }[];
}

export interface DayPoint {
  date: string; // YYYY-MM-DD, in India time
  orders: number;
  sales: number;
}

export interface VendorAnalytics {
  days: DayPoint[];
  totals: { orders: number; sales: number; avgOrderValue: number; cancelled: number; placed: number; cancellationRate: number };
  topItems: { name: string; quantity: number; sales: number }[];
}

const DELIVERED = new Set(["delivered", "completed"]);
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** The calendar day an instant falls on in India, as YYYY-MM-DD. */
export const istDay = (value: Date | string): string => new Date(new Date(value).getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);

/** Item lines of an order, whether a stop keeps them as an array or as { lines }. */
function itemLines(order: AnalyticsOrder): { name: string; quantity: number; total: number }[] {
  const out: { name: string; quantity: number; total: number }[] = [];
  for (const stop of order.stops ?? []) {
    const raw = stop?.items as any;
    const lines: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.lines) ? raw.lines : [];
    for (const line of lines) {
      const name = String(line?.name ?? "").trim();
      if (!name) continue;
      const quantity = Math.max(1, Math.round(Number(line.quantity) || 1));
      const total = Number(line.total) || (Number(line.price) || 0) * quantity;
      out.push({ name, quantity, total });
    }
  }
  return out;
}

export function computeVendorAnalytics(orders: AnalyticsOrder[], days: number, now: Date = new Date(), topN = 5): VendorAnalytics {
  // Every day of the period, so a quiet day shows as zero instead of being missing.
  const points = new Map<string, DayPoint>();
  for (let i = days - 1; i >= 0; i--) {
    const date = istDay(new Date(now.getTime() - i * 86_400_000));
    points.set(date, { date, orders: 0, sales: 0 });
  }

  let delivered = 0;
  let sales = 0;
  let cancelled = 0;
  const items = new Map<string, { name: string; quantity: number; sales: number }>();

  for (const order of orders) {
    const status = String(order.status ?? "").toLowerCase();
    if (status === "cancelled") {
      cancelled += 1;
      continue;
    }
    if (!DELIVERED.has(status)) continue;
    const amount = Number(order.priceBreakdown?.baseFare) || 0;
    delivered += 1;
    sales += amount;
    const point = points.get(istDay(order.createdAt));
    if (point) {
      point.orders += 1;
      point.sales += amount;
    }
    for (const line of itemLines(order)) {
      const key = line.name.toLowerCase();
      const entry = items.get(key) ?? { name: line.name, quantity: 0, sales: 0 };
      entry.quantity += line.quantity;
      entry.sales += line.total;
      items.set(key, entry);
    }
  }

  const placed = delivered + cancelled;
  return {
    days: [...points.values()].map((p) => ({ ...p, sales: Math.round(p.sales * 100) / 100 })),
    totals: {
      orders: delivered,
      sales: Math.round(sales * 100) / 100,
      avgOrderValue: delivered ? Math.round(sales / delivered) : 0,
      cancelled,
      placed,
      cancellationRate: placed ? Math.round((cancelled / placed) * 1000) / 10 : 0,
    },
    topItems: [...items.values()]
      .sort((a, b) => b.quantity - a.quantity || b.sales - a.sales)
      .slice(0, topN)
      .map((i) => ({ ...i, sales: Math.round(i.sales * 100) / 100 })),
  };
}
