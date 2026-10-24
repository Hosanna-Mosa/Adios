import { test } from "node:test";
import assert from "node:assert/strict";

import { PUBLIC_VENDOR_SELECT, toPublicVendor } from "./vendor.public";

const vendor = {
  _id: "64a000000000000000000001",
  name: "Spice Route",
  phone: "9876543210",
  email: "hello@spiceroute.in",
  password: "$2b$10$hash",
  owner: { name: "Owner", phone: "9000000000", email: "owner@example.com" },
  kyc: { aadhaarLast4: "1234" },
  contract: { signature: "data:image/png;base64,..." },
  commissionRate: 18,
  expoPushTokens: ["ExponentPushToken[abc]"],
  legal: { fssaiNumber: "12345678901234", fssaiExpiry: "2027-01-01", panNumber: "ABCDE1234F", bankAccount: "001122334455", ifsc: "HDFC0001234", gstin: "36ABCDE1234F1Z5" },
  operations: { dayTimeSlots: { mon: [] }, menuUploadRows: [{ itemName: "Biryani" }] },
};

test("keeps what the customer app shows: name, business phone/email, FSSAI licence, hours", () => {
  const out = toPublicVendor(vendor);
  assert.equal(out.name, "Spice Route");
  assert.equal(out.phone, "9876543210");
  assert.equal(out.email, "hello@spiceroute.in");
  assert.deepEqual(out.legal, { fssaiNumber: "12345678901234", fssaiExpiry: "2027-01-01" });
  assert.deepEqual(out.operations, { dayTimeSlots: { mon: [] } });
});

test("drops credentials, owner identity, KYC, bank, tax and push endpoints", () => {
  const out = toPublicVendor(vendor) as Record<string, unknown>;
  for (const key of ["password", "owner", "kyc", "contract", "commissionRate", "expoPushTokens"]) {
    assert.equal(key in out, false, `${key} should be removed`);
  }
});

test("does not modify the object it was given", () => {
  toPublicVendor(vendor);
  assert.equal(vendor.password, "$2b$10$hash");
  assert.equal(vendor.legal.bankAccount, "001122334455");
});

test("the populate select excludes the same fields", () => {
  const excluded = PUBLIC_VENDOR_SELECT.split(" ");
  assert.ok(excluded.includes("-password"));
  assert.ok(excluded.includes("-legal.bankAccount"));
  assert.ok(!excluded.includes("-legal.fssaiNumber"));
  assert.ok(!excluded.includes("-phone"));
});
