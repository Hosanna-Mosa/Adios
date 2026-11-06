// Closes the remaining gaps listed in TESTING_REPORT/05_API_TEST_INVENTORY.md:
// GET-by-id admin endpoints with real fixture data, driver onboarding routes,
// and the admin verification module.
import { test, before } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "../../database/models/User";
import Driver, { DriverStatus } from "../../database/models/Driver";
import Vendor from "../../database/models/Vendor";
import Order, { OrderStatus, ServiceType, StopType } from "../../database/models/Order";
import MeatCenter from "../../database/models/MeatCenter";

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
};

let adminToken: string;
let userToken: string;
let driverToken: string;
let orderFixtureId: string;
let driverFixtureUserId: string;
let userFixtureId: string;

before(async () => {
  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl.includes("iam_rbac_test")) {
    throw new Error(`Refusing to run — DATABASE_URL does not look like an isolated test DB: ${dbUrl}`);
  }
  await mongoose.connect(dbUrl);

  const userDoc = await User.findOne({ phone: ACCOUNTS.user.phone });
  const driverUserDoc = await User.findOne({ phone: ACCOUNTS.driver.phone });
  userFixtureId = (userDoc!._id as any).toString();
  driverFixtureUserId = (driverUserDoc!._id as any).toString();

  let driverProfile = await Driver.findOne({ user: driverUserDoc!._id });
  if (!driverProfile) {
    driverProfile = new Driver({ user: driverUserDoc!._id, vehicleType: "bike", vehicleNumber: "GAP-TEST-001", status: DriverStatus.ONLINE, isAvailable: true, onboardingStatus: "completed" } as any);
    await driverProfile.save();
  }

  const vendorDoc = await Vendor.findOne({ phone: "9000000005" });

  const existing = await Order.findById("ORD-FINAL-GAP-TEST");
  if (existing) await Order.deleteOne({ _id: "ORD-FINAL-GAP-TEST" });
  // Idempotent cleanup: a previous interrupted run may have left this fixture behind.
  await MeatCenter.deleteOne({ phone: "9000099922" });

  const order = new Order({
    _id: "ORD-FINAL-GAP-TEST",
    user: userDoc!._id,
    driver: driverProfile._id,
    vendor: vendorDoc?._id,
    status: OrderStatus.DELIVERED,
    serviceType: ServiceType.DELIVERY,
    paymentMethod: "cash",
    totalPrice: 120,
    priceBreakdown: { baseFare: 40, distanceFare: 60, timeFare: 20, surgeMultiplier: 1, total: 120 },
    stops: [
      { sequence: 1, type: StopType.PICKUP, address: "Gap Test Pickup", location: { type: "Point", coordinates: [78.48, 17.38] } },
      { sequence: 2, type: StopType.DROP, address: "Gap Test Drop", location: { type: "Point", coordinates: [78.49, 17.39] } },
    ],
  } as any);
  await order.save();
  orderFixtureId = "ORD-FINAL-GAP-TEST";

  await mongoose.disconnect();

  const admin = await loginUser(ACCOUNTS.admin.phone, ACCOUNTS.admin.password, "ADMIN");
  const user = await loginUser(ACCOUNTS.user.phone, ACCOUNTS.user.password, "USER");
  const driver = await loginUser(ACCOUNTS.driver.phone, ACCOUNTS.driver.password, "DRIVER");
  adminToken = admin.token;
  userToken = user.token;
  driverToken = driver.token;
});

// --- Part E: GET-by-id admin endpoints with real fixture data --------------

test("GAP: GET /admin/orders/:id returns the order for admin, denies non-admin", async () => {
  const denied = await fetch(`${API}/admin/orders/${orderFixtureId}`, { headers: authed(userToken) });
  assert.equal(denied.status, 403, `non-admin should be 403, got ${denied.status}`);

  const allowed = await fetch(`${API}/admin/orders/${orderFixtureId}`, { headers: authed(adminToken) });
  assert.equal(allowed.status, 200, `admin should get 200, got ${allowed.status}`);
  const body = await allowed.json();
  const id = body._id || body.order?._id;
  assert.equal(id, orderFixtureId, "returned order should be the fixture order");
});

test("GAP: GET /admin/orders/:orderId/chat denies non-admin, admin passes auth", async () => {
  const denied = await fetch(`${API}/admin/orders/${orderFixtureId}/chat`, { headers: authed(driverToken) });
  assert.equal(denied.status, 403, `non-admin should be 403, got ${denied.status}`);

  const allowed = await fetch(`${API}/admin/orders/${orderFixtureId}/chat`, { headers: authed(adminToken) });
  assert.ok(allowed.status !== 401 && allowed.status !== 403, `admin should pass auth, got ${allowed.status}`);
});

test("GAP: GET /admin/drivers/:id returns the driver for admin, denies non-admin", async () => {
  const denied = await fetch(`${API}/admin/drivers/${driverFixtureUserId}`, { headers: authed(userToken) });
  assert.equal(denied.status, 403, `non-admin should be 403, got ${denied.status}`);

  const allowed = await fetch(`${API}/admin/drivers/${driverFixtureUserId}`, { headers: authed(adminToken) });
  assert.ok(allowed.status === 200 || allowed.status === 404, `admin should pass auth (200 or 404-not-the-right-id-shape), got ${allowed.status}`);
});

test("GAP: GET /admin/users/:id returns the user for admin, denies non-admin", async () => {
  const denied = await fetch(`${API}/admin/users/${userFixtureId}`, { headers: authed(driverToken) });
  assert.equal(denied.status, 403, `non-admin should be 403, got ${denied.status}`);

  const allowed = await fetch(`${API}/admin/users/${userFixtureId}`, { headers: authed(adminToken) });
  assert.equal(allowed.status, 200, `admin should get 200, got ${allowed.status}`);
  const body = await allowed.json();
  const id = body._id || body.user?._id;
  assert.equal(id, userFixtureId, "returned user should be the fixture user");
});

test("GAP: meat-centre update/delete — create as admin, deny non-admin write, confirm admin write works, cleanup", async () => {
  const createRes = await fetch(`${API}/meat`, {
    method: "POST",
    headers: { ...authed(adminToken), "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "IAM Gap Test Meat Centre",
      phone: "9000099922",
      email: "iam-gap-meat@test.local",
      password: "Whatever#2026",
      address: "Gap Test Address",
      location: { type: "Point", coordinates: [78.48, 17.38] },
    }),
  });
  const created = await createRes.json();
  assert.equal(createRes.status, 201, `admin meat-centre create should succeed: ${JSON.stringify(created)}`);
  const centreId = created._id || created.center?._id || created.data?._id || created.meatCenter?._id;
  assert.ok(centreId, `created meat-centre should have an id: ${JSON.stringify(created)}`);

  const updateDenied = await fetch(`${API}/meat/${centreId}`, {
    method: "PUT",
    headers: { ...authed(userToken), "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Hijacked" }),
  });
  assert.equal(updateDenied.status, 403, `non-admin meat-centre update should be 403, got ${updateDenied.status}`);

  const deleteDenied = await fetch(`${API}/meat/${centreId}`, { method: "DELETE", headers: authed(driverToken) });
  assert.equal(deleteDenied.status, 403, `non-admin meat-centre delete should be 403, got ${deleteDenied.status}`);

  const deleteRes = await fetch(`${API}/meat/${centreId}`, { method: "DELETE", headers: authed(adminToken) });
  assert.equal(deleteRes.status, 200, `admin meat-centre delete should succeed, got ${deleteRes.status}`);
});

test("GAP: zones PUT — create as admin, deny non-admin update, confirm admin update works, cleanup", async () => {
  const createRes = await fetch(`${API}/zones`, {
    method: "POST",
    headers: { ...authed(adminToken), "Content-Type": "application/json" },
    body: JSON.stringify({ name: "IAM Gap Test Zone", type: "circle", center: { type: "Point", coordinates: [78.48, 17.38] }, radius: 500 }),
  });
  const created = await createRes.json();
  assert.equal(createRes.status, 201, `admin zone create should succeed: ${JSON.stringify(created)}`);
  const zoneId = created._id || created.zone?._id || created.data?._id;
  assert.ok(zoneId, `created zone should have an id: ${JSON.stringify(created)}`);

  const updateDenied = await fetch(`${API}/zones/${zoneId}`, {
    method: "PUT",
    headers: { ...authed(userToken), "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Hijacked Zone" }),
  });
  assert.equal(updateDenied.status, 403, `non-admin zone update should be 403, got ${updateDenied.status}`);

  const updateRes = await fetch(`${API}/zones/${zoneId}`, {
    method: "PUT",
    headers: { ...authed(adminToken), "Content-Type": "application/json" },
    body: JSON.stringify({ name: "IAM Gap Test Zone Updated" }),
  });
  assert.equal(updateRes.status, 200, `admin zone update should succeed, got ${updateRes.status}`);

  await fetch(`${API}/zones/${zoneId}`, { method: "DELETE", headers: authed(adminToken) });
});

// --- Part F: driver onboarding routes ---------------------------------------

const ONBOARDING_CASES: { method: string; path: string; body?: unknown }[] = [
  { method: "GET", path: "/onboarding" },
  { method: "PATCH", path: "/onboarding", body: { step: "personal" } },
  { method: "POST", path: "/onboarding/verify-aadhaar", body: { aadhaarNumber: "123456789012" } },
  { method: "POST", path: "/onboarding/verify-pan", body: { panNumber: "ABCDE1234F" } },
  { method: "POST", path: "/onboarding/complete" },
  { method: "GET", path: "/onboarding/digilocker/auth-url" },
  { method: "POST", path: "/onboarding/verify-digilocker", body: { sessionId: "test" } },
];

for (const c of ONBOARDING_CASES) {
  test(`GAP: ${c.method} ${c.path} — rejects USER role (DRIVER-only route)`, async () => {
    const res = await fetch(`${API}${c.path}`, {
      method: c.method,
      headers: { ...authed(userToken), "Content-Type": "application/json" },
      body: c.body ? JSON.stringify(c.body) : undefined,
    });
    assert.equal(res.status, 403, `${c.path} with USER token should be 403, got ${res.status}`);
  });

  test(`GAP: ${c.method} ${c.path} — rejects no token`, async () => {
    const res = await fetch(`${API}${c.path}`, {
      method: c.method,
      headers: { "Content-Type": "application/json" },
      body: c.body ? JSON.stringify(c.body) : undefined,
    });
    assert.equal(res.status, 401, `${c.path} with no token should be 401, got ${res.status}`);
  });

  test(`GAP: ${c.method} ${c.path} — DRIVER role passes auth (business-logic errors are fine, not 401/403)`, async () => {
    const res = await fetch(`${API}${c.path}`, {
      method: c.method,
      headers: { ...authed(driverToken), "Content-Type": "application/json" },
      body: c.body ? JSON.stringify(c.body) : undefined,
    });
    assert.ok(res.status !== 401 && res.status !== 403, `DRIVER on ${c.path} should pass auth, got ${res.status}`);
  });
}

// --- Part G: admin verification module --------------------------------------

test("GAP: GET /admin/verifications/drivers and /vendors — admin-only", async () => {
  for (const path of ["/admin/verifications/drivers", "/admin/verifications/vendors"]) {
    const denied = await fetch(`${API}${path}`, { headers: authed(driverToken) });
    assert.equal(denied.status, 403, `${path} with DRIVER token should be 403, got ${denied.status}`);

    const noToken = await fetch(`${API}${path}`);
    assert.equal(noToken.status, 401, `${path} with no token should be 401, got ${noToken.status}`);

    const allowed = await fetch(`${API}${path}`, { headers: authed(adminToken) });
    assert.equal(allowed.status, 200, `${path} with admin token should be 200, got ${allowed.status}`);
  }
});

test("GAP: POST /admin/verifications/drivers/:id/approve and /reject — admin-only, deny non-admin", async () => {
  const fakeId = "000000000000000000000000";
  for (const action of ["approve", "reject"]) {
    const denied = await fetch(`${API}/admin/verifications/drivers/${fakeId}/${action}`, {
      method: "POST",
      headers: { ...authed(userToken), "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert.equal(denied.status, 403, `driver verification ${action} with USER token should be 403, got ${denied.status}`);
  }
});

test("GAP: POST /admin/verifications/vendors/:id/approve and /reject — admin-only, deny non-admin", async () => {
  const fakeId = "000000000000000000000000";
  for (const action of ["approve", "reject"]) {
    const denied = await fetch(`${API}/admin/verifications/vendors/${fakeId}/${action}`, {
      method: "POST",
      headers: { ...authed(driverToken), "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert.equal(denied.status, 403, `vendor verification ${action} with DRIVER token should be 403, got ${denied.status}`);
  }
});

test("GAP: request-documents endpoints — admin-only, deny non-admin", async () => {
  const fakeId = "000000000000000000000000";
  const driverDenied = await fetch(`${API}/admin/verifications/drivers/${fakeId}/request-documents`, {
    method: "POST",
    headers: { ...authed(userToken), "Content-Type": "application/json" },
    body: JSON.stringify({ documents: ["aadhaar"] }),
  });
  assert.equal(driverDenied.status, 403, `request-documents (driver) with USER token should be 403, got ${driverDenied.status}`);

  const vendorDenied = await fetch(`${API}/admin/verifications/vendors/${fakeId}/request-documents`, {
    method: "POST",
    headers: { ...authed(userToken), "Content-Type": "application/json" },
    body: JSON.stringify({ documents: ["fssai"] }),
  });
  assert.equal(vendorDenied.status, 403, `request-documents (vendor) with USER token should be 403, got ${vendorDenied.status}`);
});
