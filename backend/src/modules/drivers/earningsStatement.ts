/**
 * The driver's monthly earnings statement (a page the app opens in the browser, which can
 * print or save it as a PDF — for tax / ITR records). Pure: the service gathers the rows,
 * this computes the month window and totals and renders the HTML.
 */

// India Standard Time, so "October" means October where the driver works.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** `from` (inclusive) and `to` (exclusive) for "YYYY-MM" in IST, or null for a bad / future month. */
export function statementMonthRange(month: string, now: Date = new Date()): { from: Date; to: Date; label: string } | null {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(month);
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const from = new Date(Date.UTC(year, monthIndex, 1) - IST_OFFSET_MS);
  const to = new Date(Date.UTC(year, monthIndex + 1, 1) - IST_OFFSET_MS);
  if (from.getTime() > now.getTime()) return null;
  const label = new Date(Date.UTC(year, monthIndex, 1)).toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });
  return { from, to, label };
}

export interface StatementTrip {
  date: Date;
  orderId: string;
  service: string;
  fare: number;
  earning: number;
  paymentMethod: "cash" | "online";
  /** Cash the driver confirmed collecting (cash orders). */
  cashCollected: number;
}

export interface StatementPayout {
  date: Date;
  amount: number;
  status: string;
  reference?: string | null;
}

export function summarizeStatement(trips: StatementTrip[], payouts: StatementPayout[]) {
  const sum = (values: number[]) => Math.round(values.reduce((a, b) => a + (Number(b) || 0), 0));
  return {
    trips: trips.length,
    fareTotal: sum(trips.map((t) => t.fare)),
    earningsTotal: sum(trips.map((t) => t.earning)),
    cashCollectedTotal: sum(trips.map((t) => t.cashCollected)),
    // Only money that actually left: a requested or failed cash-out isn't income received.
    payoutsTotal: sum(payouts.filter((p) => ["processed", "paid", "completed"].includes(p.status.toLowerCase())).map((p) => p.amount)),
  };
}

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const rupees = (value: number) => `₹${(Number(value) || 0).toLocaleString("en-IN")}`;
const day = (date: Date) => date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", timeZone: "Asia/Kolkata" });

/** "ABCDE1234F" → "XXXXX1234X"-style: only the digits in the middle stay readable. */
export function maskPan(pan?: string | null): string {
  const value = String(pan || "").toUpperCase();
  if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(value)) return "—";
  return `XXXXX${value.slice(5, 9)}X`;
}

export function renderStatementHtml(input: {
  driverName: string;
  panMasked: string;
  monthLabel: string;
  trips: StatementTrip[];
  payouts: StatementPayout[];
  generatedAt?: Date;
}): string {
  const totals = summarizeStatement(input.trips, input.payouts);
  const tripRows = input.trips.length
    ? input.trips
        .map(
          (t) => `<tr><td>${escapeHtml(day(t.date))}</td><td>${escapeHtml(t.orderId)}</td><td>${escapeHtml(t.service)}</td>` +
            `<td>${escapeHtml(t.paymentMethod === "cash" ? "Cash" : "Online")}</td><td class="num">${rupees(t.fare)}</td><td class="num">${rupees(t.earning)}</td></tr>`,
        )
        .join("")
    : `<tr><td colspan="6" class="empty">No completed trips this month.</td></tr>`;
  const payoutRows = input.payouts.length
    ? input.payouts
        .map(
          (p) => `<tr><td>${escapeHtml(day(p.date))}</td><td>${escapeHtml(p.status)}</td><td>${escapeHtml(p.reference || "—")}</td><td class="num">${rupees(p.amount)}</td></tr>`,
        )
        .join("")
    : `<tr><td colspan="4" class="empty">No cash-outs this month.</td></tr>`;
  const generated = (input.generatedAt ?? new Date()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Earnings statement — ${escapeHtml(input.monthLabel)}</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #1c1a22; margin: 0; padding: 24px; background: #fff; }
  h1 { font-size: 20px; margin: 0 0 4px; } h2 { font-size: 15px; margin: 28px 0 8px; }
  .muted { color: #6b6575; font-size: 13px; }
  .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-top: 18px; }
  .card { border: 1px solid #e6e1ea; border-radius: 10px; padding: 12px; }
  .card b { display: block; font-size: 17px; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 8px 6px; border-bottom: 1px solid #eee; }
  th { color: #6b6575; font-weight: 600; } .num { text-align: right; white-space: nowrap; }
  .empty { color: #6b6575; text-align: center; padding: 16px; }
  @media print { body { padding: 0; } }
</style></head><body>
<h1>Earnings statement</h1>
<div class="muted">${escapeHtml(input.monthLabel)} · ${escapeHtml(input.driverName)} · PAN ${escapeHtml(input.panMasked)}</div>
<div class="summary">
  <div class="card"><span class="muted">Completed trips</span><b>${totals.trips}</b></div>
  <div class="card"><span class="muted">Your earnings</span><b>${rupees(totals.earningsTotal)}</b></div>
  <div class="card"><span class="muted">Customer fares</span><b>${rupees(totals.fareTotal)}</b></div>
  <div class="card"><span class="muted">Cash you collected</span><b>${rupees(totals.cashCollectedTotal)}</b></div>
  <div class="card"><span class="muted">Paid to your bank</span><b>${rupees(totals.payoutsTotal)}</b></div>
</div>
<h2>Trips</h2>
<table><thead><tr><th>Date</th><th>Order</th><th>Service</th><th>Payment</th><th class="num">Fare</th><th class="num">Your earning</th></tr></thead>
<tbody>${tripRows}</tbody></table>
<h2>Cash-outs</h2>
<table><thead><tr><th>Date</th><th>Status</th><th>Reference</th><th class="num">Amount</th></tr></thead>
<tbody>${payoutRows}</tbody></table>
<p class="muted" style="margin-top:24px">System-generated statement. Generated ${escapeHtml(generated)} IST.</p>
</body></html>`;
}
