import { test } from "node:test";
import assert from "node:assert/strict";
import { computeSla, normalizePriority } from "./support.sla";
import { cleanPermissions, DEFAULT_SUPPORT_PERMISSIONS, effectivePermissions } from "./support.permissions";
import { csvCell, toCsv } from "./support.csv";

const created = new Date("2026-01-01T10:00:00Z");
const at = (minutes: number) => new Date(created.getTime() + minutes * 60_000);

test("an unknown or missing priority is NORMAL", () => {
  assert.equal(normalizePriority(undefined), "NORMAL");
  assert.equal(normalizePriority("whatever"), "NORMAL");
  assert.equal(normalizePriority("URGENT"), "URGENT");
});

test("an urgent ticket must be answered in 15 minutes", () => {
  const sla = computeSla({ priority: "URGENT", status: "OPEN", createdAt: created }, at(13))!;
  assert.equal(sla.firstResponseDueAt?.getTime(), at(15).getTime());
  assert.equal(sla.firstResponse, "due_soon");
  assert.equal(computeSla({ priority: "URGENT", status: "OPEN", createdAt: created }, at(5))!.firstResponse, "ok");
  assert.equal(computeSla({ priority: "URGENT", status: "OPEN", createdAt: created }, at(16))!.firstResponse, "breached");
});

test("a reply in time meets the first-response target, a late one breaches it", () => {
  assert.equal(computeSla({ priority: "HIGH", status: "OPEN", createdAt: created, firstResponseAt: at(30) }, at(500))!.firstResponse, "met");
  const late = computeSla({ priority: "HIGH", status: "OPEN", createdAt: created, firstResponseAt: at(90) }, at(100))!;
  assert.equal(late.firstResponse, "breached");
  assert.equal(late.firstResponseMinutes, 90);
});

test("resolution time is measured to the moment it was resolved", () => {
  const sla = computeSla({ priority: "NORMAL", status: "RESOLVED", createdAt: created, firstResponseAt: at(10), resolvedAt: at(600) }, at(5000))!;
  assert.equal(sla.resolution, "met");
  assert.equal(sla.resolutionMinutes, 600);
  const open = computeSla({ priority: "NORMAL", status: "OPEN", createdAt: created }, at(5000))!;
  assert.equal(open.resolution, "breached");
  assert.equal(open.resolutionMinutes, null);
});

test("a ticket with no creation date has no SLA", () => {
  assert.equal(computeSla({ priority: "LOW" }), null);
});

test("support members without saved permissions keep the old abilities, without export", () => {
  assert.deepEqual(effectivePermissions("SUPPORT", undefined), DEFAULT_SUPPORT_PERMISSIONS);
  assert.ok(!effectivePermissions("SUPPORT", undefined).includes("export"));
  assert.ok(effectivePermissions("ADMIN").includes("export"));
  assert.deepEqual(effectivePermissions("USER", ["reply"]), []);
});

test("saved permissions are taken as they are, and unknown ones are dropped", () => {
  assert.deepEqual(effectivePermissions("SUPPORT", ["reply"]), ["reply"]);
  assert.deepEqual(effectivePermissions("SUPPORT", []), []);
  assert.deepEqual(cleanPermissions(["reply", "reply", "root", 5]), ["reply"]);
});

test("CSV cells are quoted and formulas are neutralised", () => {
  assert.equal(csvCell('say "hi", ok'), '"say ""hi"", ok"');
  assert.equal(csvCell("=HYPERLINK(1)"), "'=HYPERLINK(1)");
  assert.equal(csvCell(null), "");
  assert.equal(toCsv(["a", "b"], [[1, "x,y"]]), 'a,b\r\n1,"x,y"');
});
