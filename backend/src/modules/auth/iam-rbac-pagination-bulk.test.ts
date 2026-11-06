// Pagination / filtering / bulk-operation authorization tests, requested as
// the final outstanding automated check for this assignment. Requires the
// backend running against the isolated test database (same as the other
// iam-rbac-*.test.ts files — run via `npm run test:iam-rbac`, not `npm test`).
import { test, before } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import FoodItem from "../../database/models/FoodItem";

const BASE = process.env.IAM_TEST_BASE_URL || "http://localhost:3000";
const API = `${BASE}/api/v1`;

function authed(token: string) {
  return { Authorization: `Bearer ${token}` };
}

async function loginVendor(phone: string, password: string) {
  const res = await fetch(`${API}/vendors/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });
  const body = await res.json();
  assert.equal(res.status, 200, `vendor login for ${phone} should succeed: ${JSON.stringify(body)}`);
  return { token: body.token as string, id: body._id as string };
}

const ACCOUNTS = {
  vendor: { phone: "9000000005", password: "TestVendor#2026" },
  vendor2: { phone: "9000000006", password: "TestVendor2#2026" },
};

before(async () => {
  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl.includes("iam_rbac_test")) {
    throw new Error(`Refusing to run — DATABASE_URL does not look like the isolated test DB: ${dbUrl}`);
  }
  // Clean up any leftover items from a previous interrupted run, by name.
  await mongoose.connect(dbUrl);
  await FoodItem.deleteMany({ name: { $regex: /^IAM Bulk Test Item/ } });
  await mongoose.disconnect();
});

// --- Bulk-operation authorization -------------------------------------------

test("BULK-T01: a vendor cannot bulk-add food items to a DIFFERENT vendor's menu (client-supplied vendorId)", async () => {
  const v1 = await loginVendor(ACCOUNTS.vendor.phone, ACCOUNTS.vendor.password);
  const v2 = await loginVendor(ACCOUNTS.vendor2.phone, ACCOUNTS.vendor2.password);

  const res = await fetch(`${API}/food/bulk`, {
    method: "POST",
    headers: { ...authed(v2.token), "Content-Type": "application/json" },
    body: JSON.stringify({
      vendorId: v1.id, // attacker (v2) supplies v1's id as the target
      items: [{ name: "IAM Bulk Test Item - Attack", category: "Mains", price: 100, isVeg: true }],
    }),
  });
  assert.equal(res.status, 403, `vendor2 bulk-adding to vendor1's menu must be 403, got ${res.status}: ${JSON.stringify(await res.clone().json().catch(() => ({})))}`);
});

test("BULK-T02: a vendor CAN bulk-add to their own menu (sanity check, then cleanup)", async () => {
  const v1 = await loginVendor(ACCOUNTS.vendor.phone, ACCOUNTS.vendor.password);

  const res = await fetch(`${API}/food/bulk`, {
    method: "POST",
    headers: { ...authed(v1.token), "Content-Type": "application/json" },
    body: JSON.stringify({
      vendorId: v1.id,
      items: [
        { name: "IAM Bulk Test Item - Own 1", category: "Mains", price: 150, isVeg: true },
        { name: "IAM Bulk Test Item - Own 2", category: "Mains", price: 200, isVeg: false },
      ],
    }),
  });
  const body = await res.json();
  assert.equal(res.status, 200, `vendor bulk-adding to their own menu should succeed: ${JSON.stringify(body)}`);
  assert.equal(body.created, 2, `both rows should have been created: ${JSON.stringify(body)}`);

  // Cleanup: remove the test items so repeat runs stay clean.
  await mongoose.connect(process.env.DATABASE_URL as string);
  await FoodItem.deleteMany({ name: { $regex: /^IAM Bulk Test Item/ } });
  await mongoose.disconnect();
});

// --- Pagination / filter parameters don't bypass ownership ------------------

test("PAGE-T01: a vendor cannot use pagination/filter query params to reach a DIFFERENT vendor's order list", async () => {
  const v1 = await loginVendor(ACCOUNTS.vendor.phone, ACCOUNTS.vendor.password);
  const v2 = await loginVendor(ACCOUNTS.vendor2.phone, ACCOUNTS.vendor2.password);

  // v2 tries to read v1's order history using every filter param the endpoint supports.
  const since = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
  const before = new Date().toISOString();
  const res = await fetch(
    `${API}/orders/vendor/${v1.id}?since=${encodeURIComponent(since)}&before=${encodeURIComponent(before)}&limit=50`,
    { headers: authed(v2.token) }
  );
  // 404 ("Vendor not found"), not 403: orders.service.ts's canActForVendor is the
  // first check and throws NotFoundError for a non-owning vendor, before the code
  // ever reaches the (separate, effectively unreachable here) canAccessVendorData
  // 403 check. Either way, access is denied and no cross-vendor data is exposed —
  // confirmed safe, just documenting the actual status code rather than what a
  // code comment elsewhere implies.
  assert.equal(res.status, 404, `vendor2 reading vendor1's orders via query filters must be blocked, got ${res.status}`);
});

test("PAGE-T02: the actual owning vendor CAN use the same pagination/filter params on their own orders (sanity check)", async () => {
  const v1 = await loginVendor(ACCOUNTS.vendor.phone, ACCOUNTS.vendor.password);

  const since = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
  const before = new Date().toISOString();
  const res = await fetch(
    `${API}/orders/vendor/${v1.id}?since=${encodeURIComponent(since)}&before=${encodeURIComponent(before)}&limit=50`,
    { headers: authed(v1.token) }
  );
  assert.equal(res.status, 200, `the owning vendor should be able to use these filters on their own orders, got ${res.status}: ${JSON.stringify(await res.clone().json().catch(() => ({})))}`);
});
