import { test } from "node:test";
import assert from "node:assert/strict";

import { saveVendorOnboardingSchema } from "./vendors.validation";

// The shape frontend/src/features/onboarding/hooks/useOnboardingForm.ts posts.
const draft = {
  status: "draft",
  partnerType: "food",
  restaurantName: "Spice Route",
  cuisines: ["Andhra", "Biryani"],
  ownerName: "Owner",
  ownerEmail: "owner@example.com",
  portalPassword: "s3cret-pass",
  ownerPhone: "9876543210",
  primaryContact: "9876543210",
  sameAsOwner: true,
  location: { lat: 16.98, lng: 81.78 },
  address: { shopNo: "12", floor: "1", area: "Main Road", city: "Rajahmundry", landmark: "Near bus stand" },
  selectedDays: ["mon", "tue"],
  dayTimeSlots: { mon: [{ open: "09:00", close: "22:00" }], tue: [] },
  menuSetupMode: "manual",
  menuReferenceFile: null,
  menuUploadValid: false,
  menuUploadRows: [{ category: "Mains", itemName: "Biryani", price: "250", description: "", type: "nonveg", isBestseller: true, image: null }],
  menuCategories: [{ name: "Mains", items: [{ name: "Biryani", price: 250, description: "", isVeg: false, isBestseller: false, photo: { name: "b.jpg" } }] }],
  panNumber: "ABCDE1234F",
  panFile: { name: "pan.pdf" },
  gstin: "",
  gstFile: null,
  gstExempt: true,
  fssaiNumber: "12345678901234",
  fssaiExpiry: "2027-01-01",
  fssaiFile: null,
  bankAccount: "001122334455",
  bankConfirm: "001122334455",
  accountType: "savings",
  ifsc: "HDFC0001234",
  chequeFile: null,
  digilockerSessionId: "sess_123",
  digilockerKey: "key_abc",
  acceptedTos: false,
  signature: "",
};

const parse = (body: unknown) => saveVendorOnboardingSchema.safeParse({ body });

test("accepts the partner website's real payload and keeps every field", () => {
  const result = parse(draft);
  assert.equal(result.success, true);
  assert.deepEqual(Object.keys(result.data!.body).sort(), Object.keys(draft).sort());
});

test("accepts NaN coordinates the form serialises as null", () => {
  assert.equal(parse({ ...draft, location: { lat: null, lng: null } }).success, true);
});

test("rejects an object where text belongs (NoSQL-style payloads)", () => {
  assert.equal(parse({ ...draft, ownerEmail: { $ne: null } }).success, false);
  assert.equal(parse({ ...draft, ownerPhone: { $gt: "" } }).success, false);
});

test("rejects oversized input", () => {
  assert.equal(parse({ ...draft, restaurantName: "x".repeat(500) }).success, false);
  const rows = Array.from({ length: 1001 }, () => draft.menuUploadRows[0]);
  assert.equal(parse({ ...draft, menuUploadRows: rows }).success, false);
});

test("drops keys the form never sends", () => {
  const result = parse({ ...draft, onboardingStatus: "approved", commissionRate: 0 });
  assert.equal(result.success, true);
  assert.equal("onboardingStatus" in result.data!.body, false);
  assert.equal("commissionRate" in result.data!.body, false);
});
