import { test } from "node:test";
import assert from "node:assert/strict";

import { declineOrderSchema, increasePriceSchema, updateStatusSchema, validateCouponSchema } from "./orders.validation";

const ok = (schema: { safeParse: (v: unknown) => { success: boolean } }, value: unknown) => schema.safeParse(value).success;
const params = { id: "64a000000000000000000001" };

test("validate-coupon needs a code and a sane cart total", () => {
  assert.equal(ok(validateCouponSchema, { body: { code: "SAVE50", cartTotal: 499 } }), true);
  assert.equal(ok(validateCouponSchema, { body: { code: "SAVE50", cartTotal: "499" } }), true);
  assert.equal(ok(validateCouponSchema, { body: { code: "   " } }), false);
  assert.equal(ok(validateCouponSchema, { body: { code: { $ne: null } } }), false);
  assert.equal(ok(validateCouponSchema, { body: { code: "SAVE50", cartTotal: -1 } }), false);
  assert.equal(ok(validateCouponSchema, { body: { code: "X".repeat(41) } }), false);
});

test("increase-price takes a positive amount within the cap", () => {
  assert.equal(ok(increasePriceSchema, { params, body: { amount: 20 } }), true);
  assert.equal(ok(increasePriceSchema, { params, body: { amount: "20" } }), true);
  assert.equal(ok(increasePriceSchema, { params, body: { amount: 0 } }), false);
  assert.equal(ok(increasePriceSchema, { params, body: { amount: -5 } }), false);
  assert.equal(ok(increasePriceSchema, { params, body: { amount: 10_001 } }), false);
  assert.equal(ok(increasePriceSchema, { params, body: { amount: "abc" } }), false);
});

test("status updates need a string status; the OTP may be a string or a number", () => {
  assert.equal(ok(updateStatusSchema, { params, body: { status: "CANCELLED" } }), true);
  assert.equal(ok(updateStatusSchema, { params, body: { status: "DELIVERED", otp: "1234" } }), true);
  assert.equal(ok(updateStatusSchema, { params, body: { status: "DELIVERED", otp: 1234 } }), true);
  assert.equal(ok(updateStatusSchema, { params, body: {} }), false);
  assert.equal(ok(updateStatusSchema, { params, body: { status: ["DELIVERED"] } }), false);
  assert.equal(ok(updateStatusSchema, { params, body: { status: "DELIVERED", otp: { $gt: "" } } }), false);
});

test("declining an order needs a short reason", () => {
  assert.equal(ok(declineOrderSchema, { params, body: { reason: "Too far" } }), true);
  assert.equal(ok(declineOrderSchema, { params, body: { reason: "" } }), false);
  assert.equal(ok(declineOrderSchema, { params, body: { reason: "x".repeat(301) } }), false);
  assert.equal(ok(declineOrderSchema, { params, body: {} }), false);
});
