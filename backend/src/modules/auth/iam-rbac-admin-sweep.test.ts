// Live sweep of the remaining admin-dashboard / role-gated endpoints not
// covered by iam-rbac-security.test.ts or iam-rbac-idor.test.ts. Every case
// here fires a real HTTP request — no endpoint is assumed safe just because
// it shares the authorizeRole middleware with an already-tested one.
import { test, before } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Vendor from "../../database/models/Vendor";

const BASE = process.env.IAM_TEST_BASE_URL || "http://localhost:3000";
const API = `${BASE}/api/v1`;

function authed(token: string) {
  return { Authorization: `Bearer ${token}` };
}

async function loginUser(phone: string, password: string, role: string) {
  const res = await fetch(`${API}/auth/login-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password, role }),
  });
  const body = await res.json();
  assert.equal(res.status, 200, `login for ${phone} should succeed: ${JSON.stringify(body)}`);
  return { token: body.token as string, userId: body.user._id as string };
}

const ACCOUNTS = {
  admin: { phone: "9999999999", password: "admin123", role: "ADMIN" },
  user: { phone: "9000000001", password: "TestUser#2026", role: "USER" },
  driver: { phone: "9000000002", password: "TestDriver#2026", role: "DRIVER" },
  support: { phone: "9000000004", password: "TestSupport#2026", role: "SUPPORT" },
};

let adminToken: string;
let userToken: string;
let driverToken: string;
let supportToken: string;
let vendorFixtureId: string;

before(async () => {
  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl.includes("iam_rbac_test")) {
    throw new Error(`Refusing to run — DATABASE_URL does not look like an isolated test DB: ${dbUrl}`);
  }
  await mongoose.connect(dbUrl);
  const v = await Vendor.findOne({ phone: "9000000005" });
  vendorFixtureId = v ? (v._id as any).toString() : "000000000000000000000000";
  await mongoose.disconnect();

  const admin = await loginUser(ACCOUNTS.admin.phone, ACCOUNTS.admin.password, "ADMIN");
  const user = await loginUser(ACCOUNTS.user.phone, ACCOUNTS.user.password, "USER");
  const driver = await loginUser(ACCOUNTS.driver.phone, ACCOUNTS.driver.password, "DRIVER");
  const support = await loginUser(ACCOUNTS.support.phone, ACCOUNTS.support.password, "SUPPORT");
  adminToken = admin.token;
  userToken = user.token;
  driverToken = driver.token;
  supportToken = support.token;
});

// --- Part A: data-driven role-boundary sweep, GET-only endpoints -----------
// For each: no token -> 401, a role NOT in allowedRoles -> 403, a role IN
// allowedRoles -> NOT 401/403 (200, or a 404/400 from missing fixture data,
// which still proves the AUTH layer let it through).

type Case = { method: string; path: string; allowedRoles: ("ADMIN" | "SUPPORT")[] };

const GET_CASES: Case[] = [
  { method: "GET", path: "/admin/orders", allowedRoles: ["ADMIN"] },
  { method: "GET", path: "/admin/drivers", allowedRoles: ["ADMIN"] },
  { method: "GET", path: "/admin/stats", allowedRoles: ["ADMIN"] },
  { method: "GET", path: "/admin/users", allowedRoles: ["ADMIN"] },
  { method: "GET", path: "/admin/payments", allowedRoles: ["ADMIN"] },
  { method: "GET", path: "/admin/analytics", allowedRoles: ["ADMIN"] },
  { method: "GET", path: "/admin/multistop", allowedRoles: ["ADMIN"] },
  { method: "GET", path: "/admin/support-members", allowedRoles: ["ADMIN"] },
  { method: "GET", path: "/admin/support-intents", allowedRoles: ["ADMIN"] },
  { method: "GET", path: "/admin/support-intents/resolvers", allowedRoles: ["ADMIN"] },
  { method: "GET", path: "/admin/config", allowedRoles: ["ADMIN"] },
  { method: "GET", path: "/admin/coupons", allowedRoles: ["ADMIN"] },
  { method: "GET", path: "/admin/dev-drivers", allowedRoles: ["ADMIN"] },
  { method: "GET", path: "/admin/banners", allowedRoles: ["ADMIN"] },
  { method: "GET", path: "/admin/offers", allowedRoles: ["ADMIN"] },
  { method: "GET", path: "/admin/app-versions", allowedRoles: ["ADMIN"] },
  { method: "GET", path: "/admin/tickets", allowedRoles: ["ADMIN", "SUPPORT"] },
  { method: "GET", path: "/analytics/live", allowedRoles: ["ADMIN"] },
  { method: "GET", path: "/analytics/summary", allowedRoles: ["ADMIN"] },
];

for (const c of GET_CASES) {
  test(`SWEEP: ${c.method} ${c.path} — no token rejected`, async () => {
    const res = await fetch(`${API}${c.path}`);
    assert.equal(res.status, 401, `${c.path} with no token should be 401, got ${res.status}`);
  });

  const deniedRoles: Array<[string, () => string]> = [
    ["USER", () => userToken],
    ["DRIVER", () => driverToken],
    ...(c.allowedRoles.includes("SUPPORT") ? [] : ([["SUPPORT", () => supportToken]] as Array<[string, () => string]>)),
  ];

  for (const [label, getToken] of deniedRoles) {
    test(`SWEEP: ${c.method} ${c.path} — ${label} role denied (403)`, async () => {
      const res = await fetch(`${API}${c.path}`, { headers: authed(getToken()) });
      assert.equal(res.status, 403, `${label} on ${c.path} should be 403, got ${res.status}`);
    });
  }

  test(`SWEEP: ${c.method} ${c.path} — allowed role(s) get past auth`, async () => {
    const token = c.allowedRoles.includes("SUPPORT") ? supportToken : adminToken;
    const res = await fetch(`${API}${c.path}`, { headers: authed(token) });
    assert.ok(res.status !== 401 && res.status !== 403, `allowed role on ${c.path} should pass auth, got ${res.status}`);
  });
}

// --- Part B: CRUD — create as admin, block non-admin write, verify admin write works, cleanup ---

test("SWEEP-CRUD: banners — non-admin cannot create/update/delete; admin can; cleaned up", async () => {
  const createDenied = await fetch(`${API}/admin/banners`, {
    method: "POST",
    headers: { ...authed(userToken), "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Attacker Banner", imageUrl: "https://example.com/x.png" }),
  });
  assert.equal(createDenied.status, 403, `non-admin banner create should be 403, got ${createDenied.status}`);

  const createRes = await fetch(`${API}/admin/banners`, {
    method: "POST",
    headers: { ...authed(adminToken), "Content-Type": "application/json" },
    body: JSON.stringify({ title: "IAM Test Banner", imageUrl: "https://example.com/test.png" }),
  });
  const created = await createRes.json();
  assert.equal(createRes.status, 201, `admin banner create should succeed: ${JSON.stringify(created)}`);
  const bannerId = created._id || created.banner?._id;
  assert.ok(bannerId, "created banner should have an id");

  const updateDenied = await fetch(`${API}/admin/banners/${bannerId}`, {
    method: "PUT",
    headers: { ...authed(driverToken), "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Hijacked" }),
  });
  assert.equal(updateDenied.status, 403, `non-admin banner update should be 403, got ${updateDenied.status}`);

  const deleteDenied = await fetch(`${API}/admin/banners/${bannerId}`, { method: "DELETE", headers: authed(supportToken) });
  assert.equal(deleteDenied.status, 403, `support deleting a banner should be 403, got ${deleteDenied.status}`);

  const deleteRes = await fetch(`${API}/admin/banners/${bannerId}`, { method: "DELETE", headers: authed(adminToken) });
  assert.equal(deleteRes.status, 200, `admin banner delete should succeed, got ${deleteRes.status}`);
});

test("SWEEP-CRUD: coupons — non-admin cannot create/toggle/delete; admin can; cleaned up", async () => {
  const createDenied = await fetch(`${API}/admin/coupons`, {
    method: "POST",
    headers: { ...authed(userToken), "Content-Type": "application/json" },
    body: JSON.stringify({ code: "ATTACK10", discountType: "FLAT", discountValue: 10 }),
  });
  assert.equal(createDenied.status, 403, `non-admin coupon create should be 403, got ${createDenied.status}`);

  const createRes = await fetch(`${API}/admin/coupons`, {
    method: "POST",
    headers: { ...authed(adminToken), "Content-Type": "application/json" },
    body: JSON.stringify({ code: "IAMTEST10", discountType: "FLAT", discountValue: 10 }),
  });
  const created = await createRes.json();
  assert.equal(createRes.status, 201, `admin coupon create should succeed: ${JSON.stringify(created)}`);
  const couponId = created._id || created.coupon?._id;
  assert.ok(couponId, "created coupon should have an id");

  const toggleDenied = await fetch(`${API}/admin/coupons/${couponId}/toggle`, { method: "PUT", headers: authed(driverToken) });
  assert.equal(toggleDenied.status, 403, `non-admin coupon toggle should be 403, got ${toggleDenied.status}`);

  const deleteRes = await fetch(`${API}/admin/coupons/${couponId}`, { method: "DELETE", headers: authed(adminToken) });
  assert.equal(deleteRes.status, 200, `admin coupon delete should succeed, got ${deleteRes.status}`);
});

test("SWEEP-CRUD: offers — non-admin cannot create/update/delete; admin can; cleaned up", async () => {
  const payload = { title: "IAM Test Offer", vendor: vendorFixtureId, discountType: "FLAT", discountValue: 25 };

  const createDenied = await fetch(`${API}/admin/offers`, {
    method: "POST",
    headers: { ...authed(supportToken), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  assert.equal(createDenied.status, 403, `support creating an offer should be 403, got ${createDenied.status}`);

  const createRes = await fetch(`${API}/admin/offers`, {
    method: "POST",
    headers: { ...authed(adminToken), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const created = await createRes.json();
  assert.equal(createRes.status, 201, `admin offer create should succeed: ${JSON.stringify(created)}`);
  const offerId = created._id || created.offer?._id;
  assert.ok(offerId, "created offer should have an id");

  const deleteDenied = await fetch(`${API}/admin/offers/${offerId}`, { method: "DELETE", headers: authed(userToken) });
  assert.equal(deleteDenied.status, 403, `non-admin offer delete should be 403, got ${deleteDenied.status}`);

  const deleteRes = await fetch(`${API}/admin/offers/${offerId}`, { method: "DELETE", headers: authed(adminToken) });
  assert.equal(deleteRes.status, 200, `admin offer delete should succeed, got ${deleteRes.status}`);
});

test("SWEEP-CRUD: zones — anyone authenticated can READ, only admin can write/delete", async () => {
  const readAsUser = await fetch(`${API}/zones`, { headers: authed(userToken) });
  assert.equal(readAsUser.status, 200, `any authenticated role should be able to list zones, got ${readAsUser.status}`);

  const createDenied = await fetch(`${API}/zones`, {
    method: "POST",
    headers: { ...authed(driverToken), "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Attacker Zone", type: "circle" }),
  });
  assert.equal(createDenied.status, 403, `non-admin zone create should be 403, got ${createDenied.status}`);

  const createRes = await fetch(`${API}/zones`, {
    method: "POST",
    headers: { ...authed(adminToken), "Content-Type": "application/json" },
    body: JSON.stringify({ name: "IAM Test Zone", type: "circle", center: { type: "Point", coordinates: [78.48, 17.38] }, radius: 1000 }),
  });
  const created = await createRes.json();
  assert.equal(createRes.status, 201, `admin zone create should succeed: ${JSON.stringify(created)}`);
  const zoneId = created._id || created.zone?._id || created.data?._id;
  assert.ok(zoneId, `created zone should have an id: ${JSON.stringify(created)}`);

  const deleteDenied = await fetch(`${API}/zones/${zoneId}`, { method: "DELETE", headers: authed(supportToken) });
  assert.equal(deleteDenied.status, 403, `non-admin zone delete should be 403, got ${deleteDenied.status}`);

  const deleteRes = await fetch(`${API}/zones/${zoneId}`, { method: "DELETE", headers: authed(adminToken) });
  assert.equal(deleteRes.status, 200, `admin zone delete should succeed, got ${deleteRes.status}`);
});

test("SWEEP-CRUD: support-intents — non-admin cannot create/update/delete; admin can; cleaned up", async () => {
  const payload = { key: "iam_test_intent", category: "general", question: { en: "Test question?" }, resolver: "manual_reply" };

  const createDenied = await fetch(`${API}/admin/support-intents`, {
    method: "POST",
    headers: { ...authed(supportToken), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  assert.equal(createDenied.status, 403, `support creating a support-intent should be 403 — intents are ADMIN-only, got ${createDenied.status}`);

  const createRes = await fetch(`${API}/admin/support-intents`, {
    method: "POST",
    headers: { ...authed(adminToken), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const created = await createRes.json();
  assert.equal(createRes.status, 201, `admin support-intent create should succeed: ${JSON.stringify(created)}`);
  const intentId = created._id || created.intent?._id;
  assert.ok(intentId, "created intent should have an id");

  const updateDenied = await fetch(`${API}/admin/support-intents/${intentId}`, {
    method: "PUT",
    headers: { ...authed(driverToken), "Content-Type": "application/json" },
    body: JSON.stringify({ enabled: false }),
  });
  assert.equal(updateDenied.status, 403, `non-admin support-intent update should be 403, got ${updateDenied.status}`);

  const deleteRes = await fetch(`${API}/admin/support-intents/${intentId}`, { method: "DELETE", headers: authed(adminToken) });
  assert.equal(deleteRes.status, 200, `admin support-intent delete should succeed, got ${deleteRes.status}`);
});

// --- Part C: admin-only vendor/meat-centre lifecycle management ------------

test("SWEEP-CRUD: vendor creation/deletion (admin-only) denies non-admin", async () => {
  const createDenied = await fetch(`${API}/vendors`, {
    method: "POST",
    headers: { ...authed(userToken), "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Attacker Vendor", phone: "9000099977", email: "attacker-vendor@test.local", password: "Whatever#2026" }),
  });
  assert.equal(createDenied.status, 403, `non-admin vendor create should be 403, got ${createDenied.status}`);

  const deleteDenied = await fetch(`${API}/vendors/${vendorFixtureId}`, { method: "DELETE", headers: authed(driverToken) });
  assert.equal(deleteDenied.status, 403, `non-admin vendor delete should be 403, got ${deleteDenied.status}`);
  // Deliberately NOT calling the admin-authorized delete here — don't want to destroy the
  // shared vendor fixture other test files depend on.
});

// --- Part D: write-boundary denial for remaining sensitive admin routes -----
// These create/modify real accounts or system config, so we only prove the
// 403 boundary holds (the security question) rather than round-tripping a
// full create+cleanup for every one (would leave real staff/account noise).

type WriteCase = { method: string; path: string; body?: unknown };

const WRITE_DENY_CASES: WriteCase[] = [
  { method: "POST", path: "/admin/users", body: { name: "Attacker", phone: "9000099955", role: "USER", password: "Whatever#2026" } },
  { method: "PUT", path: "/admin/users/000000000000000000000000", body: { name: "Hijacked" } },
  { method: "DELETE", path: "/admin/users/000000000000000000000000" },
  { method: "PUT", path: "/admin/drivers/000000000000000000000000", body: { name: "Hijacked" } },
  { method: "DELETE", path: "/admin/drivers/000000000000000000000000" },
  { method: "POST", path: "/admin/support-members", body: { name: "Attacker Staff", phone: "9000099944", password: "Whatever#2026" } },
  { method: "PUT", path: "/admin/support-members/000000000000000000000000/password", body: { newPassword: "Whatever#2026" } },
  { method: "DELETE", path: "/admin/support-members/000000000000000000000000" },
  { method: "POST", path: "/admin/dev-drivers/seed" },
  { method: "PUT", path: "/admin/dev-drivers/000000000000000000000000", body: { name: "Hijacked" } },
  { method: "DELETE", path: "/admin/dev-drivers" },
  { method: "PUT", path: "/admin/config", body: { global_settings: {} } },
  { method: "PUT", path: "/admin/app-versions", body: { platform: "android", latest: "9.9.9", minRequired: "1.0.0", storeUrl: "https://example.com" } },
  { method: "POST", path: "/admin/orders", body: { serviceType: "ride" } },
  { method: "PUT", path: "/admin/orders/ORD-NONEXISTENT", body: { status: "CANCELLED" } },
  { method: "POST", path: "/admin/tickets", body: { title: "x", category: "general", message: "x" } },
  { method: "PUT", path: "/admin/tickets/000000000000000000000000", body: { status: "RESOLVED" } },
];

for (const c of WRITE_DENY_CASES) {
  test(`SWEEP-WRITE-DENY: ${c.method} ${c.path} — rejects USER token`, async () => {
    const res = await fetch(`${API}${c.path}`, {
      method: c.method,
      headers: { ...authed(userToken), "Content-Type": "application/json" },
      body: c.body ? JSON.stringify(c.body) : undefined,
    });
    assert.equal(res.status, 403, `${c.method} ${c.path} with USER token should be 403, got ${res.status}: ${JSON.stringify(await res.clone().json().catch(() => ({})))}`);
  });

  test(`SWEEP-WRITE-DENY: ${c.method} ${c.path} — rejects DRIVER token`, async () => {
    const res = await fetch(`${API}${c.path}`, {
      method: c.method,
      headers: { ...authed(driverToken), "Content-Type": "application/json" },
      body: c.body ? JSON.stringify(c.body) : undefined,
    });
    assert.equal(res.status, 403, `${c.method} ${c.path} with DRIVER token should be 403, got ${res.status}`);
  });

  test(`SWEEP-WRITE-DENY: ${c.method} ${c.path} — rejects no token`, async () => {
    const res = await fetch(`${API}${c.path}`, {
      method: c.method,
      headers: { "Content-Type": "application/json" },
      body: c.body ? JSON.stringify(c.body) : undefined,
    });
    assert.equal(res.status, 401, `${c.method} ${c.path} with no token should be 401, got ${res.status}`);
  });
}

// SUPPORT role gets a dedicated check for the two endpoints it's allowed to write to.
test("SWEEP-WRITE-DENY: SUPPORT can create/update tickets but not other admin-only writes", async () => {
  const ticketCreate = await fetch(`${API}/admin/tickets`, {
    method: "POST",
    headers: { ...authed(supportToken), "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Support-raised test ticket", category: "general", message: "test" }),
  });
  assert.ok(ticketCreate.status !== 401 && ticketCreate.status !== 403, `support should be allowed to create tickets, got ${ticketCreate.status}`);

  const usersWriteDenied = await fetch(`${API}/admin/users`, {
    method: "POST",
    headers: { ...authed(supportToken), "Content-Type": "application/json" },
    body: JSON.stringify({ name: "x", phone: "9000099933", role: "USER", password: "Whatever#2026" }),
  });
  assert.equal(usersWriteDenied.status, 403, `support creating a user should be 403, got ${usersWriteDenied.status}`);
});

test("SWEEP-CRUD: meat-centre creation/update/delete (admin-only) denies non-admin", async () => {
  const createDenied = await fetch(`${API}/meat`, {
    method: "POST",
    headers: { ...authed(userToken), "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Attacker Meat Centre", phone: "9000099966", email: "attacker-meat@test.local", password: "Whatever#2026" }),
  });
  assert.equal(createDenied.status, 403, `non-admin meat-centre create should be 403, got ${createDenied.status}`);

  const globalPricesDenied = await fetch(`${API}/meat/global-prices`, {
    method: "PUT",
    headers: { ...authed(supportToken), "Content-Type": "application/json" },
    body: JSON.stringify({ chicken: 200 }),
  });
  assert.equal(globalPricesDenied.status, 403, `non-admin global meat-price update should be 403, got ${globalPricesDenied.status}`);
});
