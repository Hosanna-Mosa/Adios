import { test } from "node:test";
import assert from "node:assert/strict";
import { computeVendorAnalytics, istDay } from "./vendor-analytics";
import { offerProblem } from "./vendor-offers.controller";

const now = new Date("2026-03-10T08:00:00Z"); // 13:30 in India

const order = (iso: string, status: string, baseFare: number, items: any[] = []) => ({
  createdAt: new Date(iso),
  status,
  priceBreakdown: { baseFare },
  stops: [{ items }],
});

test("a day is counted in India time, not UTC", () => {
  assert.equal(istDay("2026-03-09T19:00:00Z"), "2026-03-10"); // 00:30 IST next morning
  assert.equal(istDay("2026-03-09T17:00:00Z"), "2026-03-09");
});

test("every day of the period is present, quiet days as zero", () => {
  const a = computeVendorAnalytics([], 7, now);
  assert.equal(a.days.length, 7);
  assert.equal(a.days[6].date, "2026-03-10");
  assert.equal(a.days[0].date, "2026-03-04");
  assert.ok(a.days.every((d) => d.orders === 0 && d.sales === 0));
});

test("sales count delivered orders only, and cancellations are reported separately", () => {
  const a = computeVendorAnalytics(
    [
      order("2026-03-10T05:00:00Z", "delivered", 400),
      order("2026-03-10T06:00:00Z", "COMPLETED", 200),
      order("2026-03-09T06:00:00Z", "cancelled", 999),
      order("2026-03-09T07:00:00Z", "searching_driver", 300),
    ],
    7,
    now,
  );
  assert.equal(a.totals.orders, 2);
  assert.equal(a.totals.sales, 600);
  assert.equal(a.totals.avgOrderValue, 300);
  assert.equal(a.totals.cancelled, 1);
  assert.equal(a.totals.placed, 3);
  assert.equal(a.totals.cancellationRate, 33.3);
  assert.deepEqual(a.days[6], { date: "2026-03-10", orders: 2, sales: 600 });
});

test("top dishes add up quantities across orders and stop shapes", () => {
  const a = computeVendorAnalytics(
    [
      order("2026-03-10T05:00:00Z", "delivered", 0, [{ name: "Biryani", quantity: 2, price: 200 }, { name: "Raita", quantity: 1, total: 40 }]),
      { createdAt: new Date("2026-03-09T05:00:00Z"), status: "delivered", priceBreakdown: { baseFare: 0 }, stops: [{ items: { lines: [{ name: "biryani", quantity: 1, price: 200 }] } }] },
    ],
    7,
    now,
  );
  assert.deepEqual(a.topItems[0], { name: "Biryani", quantity: 3, sales: 600 });
  assert.equal(a.topItems[1].name, "Raita");
});

test("no orders means no divide-by-zero", () => {
  const a = computeVendorAnalytics([], 30, now);
  assert.equal(a.totals.avgOrderValue, 0);
  assert.equal(a.totals.cancellationRate, 0);
  assert.deepEqual(a.topItems, []);
});

test("partner offers are kept within sensible limits", () => {
  const base = { code: "WELCOME", discountType: "PERCENTAGE" as const, discountValue: 20 };
  assert.equal(offerProblem(base, now), null);
  assert.match(offerProblem({ ...base, discountValue: 80 }, now)!, /between 1% and 50%/);
  assert.match(offerProblem({ ...base, discountType: "FLAT", discountValue: 900 }, now)!, /between ₹1 and ₹500/);
  assert.match(offerProblem({ ...base, discountType: "FLAT", discountValue: 100, minOrderValue: 50 }, now)!, /at least the discount/);
  assert.match(offerProblem({ ...base, expiryDate: "2026-03-01" }, now)!, /in the future/);
  assert.equal(offerProblem({ ...base, expiryDate: "2026-04-01" }, now), null);
});
