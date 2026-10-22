import { test } from "node:test";
import assert from "node:assert/strict";
import { describeRequest, sanitizeForAudit } from "./auditLog.middleware";

test("secrets are never written to the trail", () => {
  const clean: any = sanitizeForAudit({ name: "Asha", password: "hunter2", newPassword: "x", otp: "1234", nested: { authToken: "abc", ok: 1 } });
  assert.equal(clean.name, "Asha");
  assert.equal(clean.password, "[redacted]");
  assert.equal(clean.newPassword, "[redacted]");
  assert.equal(clean.otp, "[redacted]");
  assert.equal(clean.nested.authToken, "[redacted]");
  assert.equal(clean.nested.ok, 1);
});

test("long text, long lists and deep objects are cut short", () => {
  assert.equal((sanitizeForAudit("a".repeat(900)) as string).length, 501);
  assert.equal((sanitizeForAudit(Array.from({ length: 100 }, (_, i) => i)) as number[]).length, 25);
  assert.equal((sanitizeForAudit({ a: { b: { c: { d: { e: 1 } } } } }) as any).a.b.c.d, "[nested]");
});

test("Mongo operators in a body are dropped", () => {
  assert.deepEqual(sanitizeForAudit({ $set: { role: "ADMIN" }, status: "ok" }), { status: "ok" });
});

test("an admin driver update is described with its target", () => {
  const d = describeRequest("/api/v1/admin/drivers/66aa11bb22cc33dd44ee55ff?x=1");
  assert.equal(d.pattern, "/admin/drivers/:id");
  assert.equal(d.targetId, "66aa11bb22cc33dd44ee55ff");
  assert.equal(d.targetType, "Driver");
});

test("pricing changes are recorded against the system config", () => {
  const d = describeRequest("/api/v1/admin/config");
  assert.equal(d.config, true);
  assert.equal(d.targetType, "SystemConfig");
});

test("refunds and payouts are recorded against the order or payout they touch", () => {
  const refund = describeRequest("/api/v1/admin/refunds/ADSF010125123456/retry");
  assert.equal(refund.pattern, "/admin/refunds/:id/retry");
  assert.equal(refund.targetId, "ADSF010125123456");
  assert.equal(refund.targetType, "refunds");
});
