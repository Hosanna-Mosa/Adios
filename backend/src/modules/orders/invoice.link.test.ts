import { test } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-for-invoice-links";

import { invoiceTokenAllows, isInvoiceable, signInvoiceToken } from "./invoice.link";

test("an invoice token opens its own order's invoice", () => {
  const token = signInvoiceToken("ADSF161026123456", "64a000000000000000000001");
  assert.equal(invoiceTokenAllows(token, "ADSF161026123456"), true);
});

test("an invoice token does not open another order", () => {
  const token = signInvoiceToken("ADSF161026123456", "64a000000000000000000001");
  assert.equal(invoiceTokenAllows(token, "ADSF161026999999"), false);
});

test("a session token or a missing / garbled token is refused", () => {
  const session = jwt.sign({ userId: "64a000000000000000000001", role: "USER" }, process.env.JWT_SECRET!);
  assert.equal(invoiceTokenAllows(session, "ADSF161026123456"), false);
  assert.equal(invoiceTokenAllows(undefined, "ADSF161026123456"), false);
  assert.equal(invoiceTokenAllows("not-a-jwt", "ADSF161026123456"), false);
  const otherKey = jwt.sign({ purpose: "invoice", orderId: "ADSF161026123456" }, "another-secret");
  assert.equal(invoiceTokenAllows(otherKey, "ADSF161026123456"), false);
});

test("an expired invoice token is refused", () => {
  const expired = jwt.sign({ purpose: "invoice", orderId: "X1", exp: Math.floor(Date.now() / 1000) - 5 }, process.env.JWT_SECRET!);
  assert.equal(invoiceTokenAllows(expired, "X1"), false);
});

test("only delivered or completed orders have an invoice", () => {
  assert.equal(isInvoiceable("DELIVERED"), true);
  assert.equal(isInvoiceable("delivered"), true);
  assert.equal(isInvoiceable("COMPLETED"), true);
  assert.equal(isInvoiceable("CANCELLED"), false);
  assert.equal(isInvoiceable("SEARCHING_DRIVER"), false);
  assert.equal(isInvoiceable(undefined), false);
});
