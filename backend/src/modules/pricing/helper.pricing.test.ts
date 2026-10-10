import { test } from "node:test";
import assert from "node:assert/strict";
import { clampHelperHours, computeHelperQuote, HELPER_RATE_DEFAULTS, helperStopsDistanceKm, resolveHelperRates } from "./helper.pricing";

const rates = HELPER_RATE_DEFAULTS;

test("matches the fare the customer app used to compute", () => {
  // 2 h, no drop-off: (40 + 160 + 0 + 5) = 205, +5% (10) = 215
  assert.equal(computeHelperQuote({ hours: 2 }, rates).total, 215);
  // 1 h, 5 km: 40 + 80 + round(3 * 15) + 5 = 170, +9 = 179
  assert.equal(computeHelperQuote({ hours: 1, distanceKm: 5 }, rates).total, 179);
});

test("no distance charge within the free km", () => {
  assert.equal(computeHelperQuote({ hours: 1, distanceKm: 1.9 }, rates).distanceFare, 0);
});

test("surge multiplies the work, not the platform fee", () => {
  const q = computeHelperQuote({ hours: 1, surgeMultiplier: 1.5 }, rates);
  // round(120 * 1.5) + 5 = 185, +9 = 194
  assert.equal(q.total, 194);
});

test("offer range follows the configured percentages", () => {
  const q = computeHelperQuote({ hours: 2 }, rates);
  assert.equal(q.minOffer, Math.ceil(215 * 0.85));
  assert.equal(q.maxOffer, Math.floor(215 * 3));
  assert.ok(q.suggestedLow >= q.minOffer && q.suggestedHigh <= q.maxOffer);
});

test("hours are clamped; junk counts as one hour", () => {
  assert.equal(clampHelperHours("abc", rates), 1);
  assert.equal(clampHelperHours(0, rates), 1);
  assert.equal(clampHelperHours(100, rates), rates.maxHours);
  assert.equal(clampHelperHours(0.1, rates), rates.minHours);
});

test("saved rates override defaults; bad values are ignored", () => {
  const r = resolveHelperRates({ perHourRate: "120", baseFare: -5, taxPercent: "x" });
  assert.equal(r.perHourRate, 120);
  assert.equal(r.baseFare, rates.baseFare);
  assert.equal(r.taxPercent, rates.taxPercent);
});

test("distance between first and last stop, any coordinate shape", () => {
  assert.equal(helperStopsDistanceKm([{ lat: 17, lng: 81 }]), 0);
  const km = helperStopsDistanceKm([{ latitude: 17, longitude: 81 }, { location: { coordinates: [81, 17.01] } }]);
  assert.ok(km > 1.0 && km < 1.2);
});
