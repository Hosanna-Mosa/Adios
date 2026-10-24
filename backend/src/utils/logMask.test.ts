import { test } from "node:test";
import assert from "node:assert/strict";

import { maskEmail, maskPhone } from "./logMask";

test("maskPhone keeps only the last four digits", () => {
  assert.equal(maskPhone("+91 98765 43210"), "******3210");
  assert.equal(maskPhone("9876543210"), "******3210");
  assert.equal(maskPhone(undefined), "(none)");
  assert.equal(maskPhone(""), "(none)");
});

test("maskEmail keeps the first letter and the domain", () => {
  assert.equal(maskEmail("dhanush@example.com"), "d***@example.com");
  assert.equal(maskEmail("not-an-email"), "***");
  assert.equal(maskEmail(null), "(none)");
});
