import { test } from "node:test";
import assert from "node:assert/strict";
import { maskPan, parseStatementPeriod, renderStatementHtml, statementMonthRange, summarizeStatement, type StatementTrip } from "./earningsStatement";

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

const workStart = new Date("2026-03-10T05:00:00Z"); // 10 Mar 2026, IST

test("a period must be real dates, in order, not future, and not before the driver started", () => {
  const ok = parseStatementPeriod("2026-09-01", "2026-09-30", { workStart, now });
  assert.ok(ok.ok);
  if (ok.ok) {
    assert.equal(ok.from.toISOString(), "2026-08-31T18:30:00.000Z");
    assert.equal(ok.to.toISOString(), "2026-09-30T18:30:00.000Z");
    assert.equal(ok.overOneYear, false);
  }
  for (const [from, to] of [
    ["", "2026-09-30"], ["2026-02-30", "2026-09-30"], ["2026-9-1", "2026-09-30"], ["2026-09-30", "2026-09-01"],
    ["2026-09-01", "2026-10-18"], ["2026-03-09", "2026-09-30"],
  ]) {
    assert.equal(parseStatementPeriod(from, to, { workStart, now }).ok, false, `${from}..${to}`);
  }
  assert.ok(parseStatementPeriod("2026-03-10", "2026-10-17", { workStart, now }).ok); // first day and today
});

test("more than one calendar year is flagged for email", () => {
  const early = new Date("2020-01-01T00:00:00Z");
  const flag = (from: string, to: string) => {
    const p = parseStatementPeriod(from, to, { workStart: early, now });
    return p.ok && p.overOneYear;
  };
  assert.equal(flag("2025-10-17", "2026-10-16"), false);
  assert.equal(flag("2025-10-17", "2026-10-17"), false);
  assert.equal(flag("2025-10-16", "2026-10-17"), true);
  assert.equal(flag("2024-02-29", "2025-02-28"), false);
});
