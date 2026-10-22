import { test } from "node:test";
import assert from "node:assert/strict";
import { describeRazorpayXFailure, mapRazorpayXStatus } from "./razorpayx.client";

// What RazorpayX reports decides whether a payout stays in the balance, is paid, or is given back.

test("processed is the only state that means the money has been paid", () => {
  assert.equal(mapRazorpayXStatus("processed"), "processed");
});

test("failed, rejected, cancelled and reversed payouts are released back to the balance", () => {
  for (const status of ["failed", "rejected", "cancelled", "reversed"]) {
    assert.equal(mapRazorpayXStatus(status), "failed", status);
  }
});

test("everything still in flight stays processing", () => {
  for (const status of ["queued", "pending", "scheduled", "processing", "something-new"]) {
    assert.equal(mapRazorpayXStatus(status), "processing", status);
  }
});

test("the failure reason prefers the bank's own description", () => {
  assert.equal(describeRazorpayXFailure({ status: "failed", status_details: { description: "Account closed" }, failure_reason: "x" } as any), "Account closed");
  assert.equal(describeRazorpayXFailure({ status: "failed", failure_reason: "Invalid IFSC" } as any), "Invalid IFSC");
  assert.equal(describeRazorpayXFailure({ status: "reversed" } as any), "Payout reversed by the bank");
  assert.equal(describeRazorpayXFailure({ status: "rejected" } as any), "Payout rejected");
});
