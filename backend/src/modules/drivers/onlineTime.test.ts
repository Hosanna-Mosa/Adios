import { test } from "node:test";
import assert from "node:assert/strict";
import { onlineHoursWithin, overlapMs, sessionEnd, SESSION_STALE_MS } from "./onlineTime";

const at = (iso: string) => new Date(iso);
const now = at("2026-10-17T12:00:00Z");

test("a closed stretch counts from its start to its end", () => {
  const s = { startedAt: at("2026-10-17T08:00:00Z"), endedAt: at("2026-10-17T10:30:00Z"), lastSeenAt: at("2026-10-17T10:30:00Z") };
  assert.equal(onlineHoursWithin([s], at("2026-10-17T00:00:00Z"), now, now), 2.5);
});

test("only the part inside the window counts", () => {
  const s = { startedAt: at("2026-10-16T22:00:00Z"), endedAt: at("2026-10-17T02:00:00Z"), lastSeenAt: at("2026-10-17T02:00:00Z") };
  // window starts at midnight: 2 of the 4 hours
  assert.equal(onlineHoursWithin([s], at("2026-10-17T00:00:00Z"), now, now), 2);
});

test("an open stretch heard from a moment ago counts up to now", () => {
  const s = { startedAt: at("2026-10-17T10:00:00Z"), lastSeenAt: at("2026-10-17T11:59:00Z") };
  assert.equal(sessionEnd(s, now).toISOString(), now.toISOString());
  assert.equal(onlineHoursWithin([s], at("2026-10-17T00:00:00Z"), now, now), 2);
});

test("an open stretch that went silent stops shortly after the last sign of life", () => {
  const s = { startedAt: at("2026-10-17T06:00:00Z"), lastSeenAt: at("2026-10-17T07:00:00Z") };
  const end = sessionEnd(s, now);
  assert.equal(end.getTime(), at("2026-10-17T07:00:00Z").getTime() + SESSION_STALE_MS);
  // 06:00 -> 07:10 = 1h10m
  assert.equal(onlineHoursWithin([s], at("2026-10-17T00:00:00Z"), now, now), 1.2);
});

test("stretches outside the window, and an empty list, add nothing", () => {
  const old = { startedAt: at("2026-10-01T08:00:00Z"), endedAt: at("2026-10-01T12:00:00Z"), lastSeenAt: at("2026-10-01T12:00:00Z") };
  assert.equal(overlapMs(old, at("2026-10-10T00:00:00Z"), now, now), 0);
  assert.equal(onlineHoursWithin([], at("2026-10-10T00:00:00Z"), now, now), 0);
});

test("several stretches add up", () => {
  const a = { startedAt: at("2026-10-17T01:00:00Z"), endedAt: at("2026-10-17T02:00:00Z"), lastSeenAt: at("2026-10-17T02:00:00Z") };
  const b = { startedAt: at("2026-10-17T05:00:00Z"), endedAt: at("2026-10-17T06:30:00Z"), lastSeenAt: at("2026-10-17T06:30:00Z") };
  assert.equal(onlineHoursWithin([a, b], at("2026-10-17T00:00:00Z"), now, now), 2.5);
});
