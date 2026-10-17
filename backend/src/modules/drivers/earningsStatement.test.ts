import { test } from "node:test";
import assert from "node:assert/strict";
import { maskPan, renderStatementHtml, statementMonthRange, summarizeStatement, type StatementTrip } from "./earningsStatement";

const now = new Date("2026-10-17T10:00:00Z");

test("a month runs from IST midnight on the 1st to IST midnight on the next 1st", () => {
  const range = statementMonthRange("2026-09", now)!;
  assert.equal(range.from.toISOString(), "2026-08-31T18:30:00.000Z");
  assert.equal(range.to.toISOString(), "2026-09-30T18:30:00.000Z");
  assert.match(range.label, /September 2026/);
});

test("the current month is allowed; future and malformed months are not", () => {
  assert.ok(statementMonthRange("2026-10", now));
  assert.equal(statementMonthRange("2026-11", now), null);
  assert.equal(statementMonthRange("2026-13", now), null);
  assert.equal(statementMonthRange("26-10", now), null);
  assert.equal(statementMonthRange("", now), null);
});

const trip = (o: Partial<StatementTrip> = {}): StatementTrip => ({
  date: new Date("2026-09-10T08:00:00Z"),
  orderId: "ADSR100926123456",
  service: "Ride",
  fare: 100,
  earning: 80,
  paymentMethod: "online",
  cashCollected: 0,
  ...o,
});

test("totals add trips, earnings, cash collected and only completed payouts", () => {
  const totals = summarizeStatement(
    [trip(), trip({ fare: 350, earning: 280, paymentMethod: "cash", cashCollected: 350 })],
    [
      { date: new Date(), amount: 500, status: "processed" },
      { date: new Date(), amount: 200, status: "failed" },
      { date: new Date(), amount: 100, status: "pending" },
    ],
  );
  assert.deepEqual(totals, { trips: 2, fareTotal: 450, earningsTotal: 360, cashCollectedTotal: 350, payoutsTotal: 500 });
});

test("PAN is masked down to its four digits", () => {
  assert.equal(maskPan("abcde1234f"), "XXXXX1234X");
  assert.equal(maskPan(undefined), "—");
  assert.equal(maskPan("bad"), "—");
});

test("the statement escapes everything it prints", () => {
  const html = renderStatementHtml({
    driverName: "<script>alert(1)</script>",
    panMasked: "XXXXX1234X",
    monthLabel: "September 2026",
    trips: [trip({ orderId: "<b>x</b>" })],
    payouts: [],
  });
  assert.ok(!html.includes("<script>alert(1)</script>"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(!html.includes("<b>x</b>"));
  assert.ok(html.includes("No cash-outs this month."));
});
