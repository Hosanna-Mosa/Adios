// Dedicated regression tests for the 5 IAM-002 gaps found during the
// 2026-10-31 IAM/RBAC consolidated audit: the original IAM-002 fix covered
// the self-service password-change and the admin-vendor-edit status-change
// paths, but missed several sibling code paths with the identical bug —
// forgot-password resets (Vendor and MeatCenter), the separate admin
// Verification-page reject/request-documents flow, the admin MeatCenter
// password update, and the Socket.IO handshake authentication. See
// TESTING_REPORT/02_FINDINGS_REGISTER.md for the full writeup.
//
// Runs via live HTTP + a real socket.io-client connection against the
// isolated test backend — run via `npm run test:iam-rbac`, not `npm test`.
// Each test creates its own throwaway Vendor/MeatCenter fixture rather than
// reusing the shared seeded accounts, since these tests are destructive
// (password resets, status changes) and must not disturb other tests' or
// the manual QA checklist's assumptions about the shared fixtures' state.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { io as ioClient, Socket } from "socket.io-client";
dotenv.config();

import User, { UserRole } from "../../database/models/User";
import Vendor from "../../database/models/Vendor";
import MeatCenter from "../../database/models/MeatCenter";
import OTP from "../../database/models/OTP";

const BASE = process.env.IAM_TEST_BASE_URL || "http://localhost:3000";
const API = `${BASE}/api/v1`;

function authed(token: string) {
  return { Authorization: `Bearer ${token}` };
}

function assertIsolatedTestEnvironment() {
  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl.includes("iam_rbac_test")) {
    throw new Error(`Refusing to run — DATABASE_URL does not look like the isolated test DB: ${dbUrl || "(unset)"}`);
  }
}

async function makeVendor(suffix: string) {
  const vendor = new Vendor({
    name: `IAM002 Gap Test Vendor ${suffix}`,
    phone: `90000997${suffix}`,
    email: `iam002-gap-vendor-${suffix}@test.local`,
    password: `GapTest${suffix}#2026`,
    partnerType: "food",
    onboardingStatus: "approved",
    address: "Gap Test Address",
    location: { type: "Point", coordinates: [78.48, 17.38] },
  } as any);
  await vendor.save();
  return vendor;
}

async function makeMeatCenter(suffix: string) {
  const center = new MeatCenter({
    name: `IAM002 Gap Test MeatCenter ${suffix}`,
    phone: `90000996${suffix}`,
    email: `iam002-gap-meat-${suffix}@test.local`,
    password: `GapTest${suffix}#2026`,
    address: "Gap Test Address",
    location: { type: "Point", coordinates: [78.48, 17.38] },
  } as any);
  await center.save();
  return center;
}

async function loginVendor(phone: string, password: string) {
  const res = await fetch(`${API}/vendors/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });
  const body = await res.json();
  assert.equal(res.status, 200, `vendor login should succeed: ${JSON.stringify(body)}`);
  return body.token as string;
}

async function loginMeatCenter(phone: string, password: string) {
  const res = await fetch(`${API}/meat/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });
  const body = await res.json();
  assert.equal(res.status, 200, `meat-centre login should succeed: ${JSON.stringify(body)}`);
  return body.token as string;
}

// The isolated test environment's SMTP credentials are placeholders, so the
// real /forgot-password endpoints 500 (nodemailer "Invalid login") before
// ever reaching the fix under test in resetVendorPassword/
// resetMeatVendorPassword — a pre-existing environment limitation unrelated
// to IAM-002. Seeding the OTP record directly tests the actual reset
// endpoint (where the fix lives) without depending on that unrelated,
// already-broken email step.
async function seedOtp(email: string, phone: string): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await mongoose.connect(process.env.DATABASE_URL as string);
  await OTP.create({ phone, email, code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
  await mongoose.disconnect();
  return code;
}

let adminToken: string;

before(async () => {
  assertIsolatedTestEnvironment();
  await mongoose.connect(process.env.DATABASE_URL as string);
  await Vendor.deleteMany({ phone: { $regex: /^90000997/ } });
  await MeatCenter.deleteMany({ phone: { $regex: /^90000996/ } });
  await mongoose.disconnect();

  const adminRes = await fetch(`${API}/auth/login-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: "9999999999", password: "admin123", role: "ADMIN" }),
  });
  const adminBody = await adminRes.json();
  assert.equal(adminRes.status, 200, `admin login should succeed: ${JSON.stringify(adminBody)}`);
  adminToken = adminBody.token;
});

after(async () => {
  await mongoose.connect(process.env.DATABASE_URL as string);
  await Vendor.deleteMany({ phone: { $regex: /^90000997/ } });
  await MeatCenter.deleteMany({ phone: { $regex: /^90000996/ } });
  await mongoose.disconnect();
});

// --- Gap 2: Vendor forgot-password reset ------------------------------------

test("IAM002-T01: Vendor forgot-password reset invalidates the old token", async () => {
  await mongoose.connect(process.env.DATABASE_URL as string);
  const vendor = await makeVendor("1");
  await mongoose.disconnect();

  const oldToken = await loginVendor(vendor.phone, "GapTest1#2026");
  const before1 = await fetch(`${API}/vendors/me`, { headers: authed(oldToken) });
  assert.equal(before1.status, 200, "old token should work before reset");

  const otp = await seedOtp(vendor.email as string, vendor.phone);

  const resetRes = await fetch(`${API}/vendors/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: vendor.email, otp, newPassword: "NewGapTest1#2026" }),
  });
  assert.equal(resetRes.status, 200, `reset-password should succeed: ${JSON.stringify(await resetRes.clone().json())}`);

  const after1 = await fetch(`${API}/vendors/me`, { headers: authed(oldToken) });
  assert.equal(after1.status, 401, "old token must be rejected after a forgot-password reset");
});

// --- Gaps 1a/1b: Admin Verification-page reject / request-documents --------

test("IAM002-T02: Admin rejecting a vendor via the Verification page invalidates the old token", async () => {
  await mongoose.connect(process.env.DATABASE_URL as string);
  const vendor = await makeVendor("2");
  await mongoose.disconnect();

  const oldToken = await loginVendor(vendor.phone, "GapTest2#2026");
  const before1 = await fetch(`${API}/vendors/me`, { headers: authed(oldToken) });
  assert.equal(before1.status, 200);

  const rejectRes = await fetch(`${API}/admin/verifications/vendors/${vendor._id}/reject`, {
    method: "POST",
    headers: { ...authed(adminToken), "Content-Type": "application/json" },
    body: JSON.stringify({ reason: "IAM-002 gap test" }),
  });
  assert.equal(rejectRes.status, 200, `reject should succeed: ${JSON.stringify(await rejectRes.clone().json())}`);

  const after1 = await fetch(`${API}/vendors/me`, { headers: authed(oldToken) });
  assert.equal(after1.status, 401, "old token must be rejected after verification rejection");
});

test("IAM002-T03: Admin requesting resubmission from a vendor invalidates the old token", async () => {
  await mongoose.connect(process.env.DATABASE_URL as string);
  const vendor = await makeVendor("3");
  await mongoose.disconnect();

  const oldToken = await loginVendor(vendor.phone, "GapTest3#2026");
  const before1 = await fetch(`${API}/vendors/me`, { headers: authed(oldToken) });
  assert.equal(before1.status, 200);

  const reqRes = await fetch(`${API}/admin/verifications/vendors/${vendor._id}/request-documents`, {
    method: "POST",
    headers: { ...authed(adminToken), "Content-Type": "application/json" },
    body: JSON.stringify({ documents: ["fssai"], note: "IAM-002 gap test" }),
  });
  assert.equal(reqRes.status, 200, `request-documents should succeed: ${JSON.stringify(await reqRes.clone().json())}`);

  const after1 = await fetch(`${API}/vendors/me`, { headers: authed(oldToken) });
  assert.equal(after1.status, 401, "old token must be rejected after a resubmission request");
});

// --- Gap 3: MeatCenter forgot-password reset --------------------------------

test("IAM002-T04: MeatCenter forgot-password reset invalidates the old token", async () => {
  await mongoose.connect(process.env.DATABASE_URL as string);
  const center = await makeMeatCenter("1");
  await mongoose.disconnect();

  const oldToken = await loginMeatCenter(center.phone, "GapTest1#2026");
  const before1 = await fetch(`${API}/vendors/me`, { headers: authed(oldToken) });
  assert.ok(before1.status === 200, `old token should work before reset, got ${before1.status}`);

  const otp = await seedOtp(center.email as string, center.phone);

  const resetRes = await fetch(`${API}/meat/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: center.email, otp, newPassword: "NewGapTest1#2026" }),
  });
  assert.equal(resetRes.status, 200, `reset-password should succeed: ${JSON.stringify(await resetRes.clone().json())}`);

  const after1 = await fetch(`${API}/vendors/me`, { headers: authed(oldToken) });
  assert.equal(after1.status, 401, "old token must be rejected after a forgot-password reset");
});

// --- Gap 4: Admin PUT /meat/:id password update -----------------------------

test("IAM002-T05: Admin updating a MeatCenter's password via PUT /meat/:id invalidates the old token", async () => {
  await mongoose.connect(process.env.DATABASE_URL as string);
  const center = await makeMeatCenter("2");
  await mongoose.disconnect();

  const oldToken = await loginMeatCenter(center.phone, "GapTest2#2026");
  const before1 = await fetch(`${API}/vendors/me`, { headers: authed(oldToken) });
  assert.ok(before1.status === 200, `old token should work before admin update, got ${before1.status}`);

  const updateRes = await fetch(`${API}/meat/${center._id}`, {
    method: "PUT",
    headers: { ...authed(adminToken), "Content-Type": "application/json" },
    body: JSON.stringify({ password: "AdminSetGapTest2#2026" }),
  });
  assert.equal(updateRes.status, 200, `admin update should succeed: ${JSON.stringify(await updateRes.clone().json())}`);

  const after1 = await fetch(`${API}/vendors/me`, { headers: authed(oldToken) });
  assert.equal(after1.status, 401, "old token must be rejected after an admin password update");
});

// --- Gap 5: Socket.IO handshake authentication ------------------------------

function connectSocket(token: string): Promise<{ connected: boolean; errorMessage?: string }> {
  return new Promise((resolve) => {
    const socket: Socket = ioClient(BASE, {
      path: "/ws/v1/socket.io",
      auth: { token },
      reconnection: false,
      timeout: 5000,
      transports: ["websocket"],
    });
    const finish = (result: { connected: boolean; errorMessage?: string }) => {
      socket.close();
      resolve(result);
    };
    socket.on("connect", () => finish({ connected: true }));
    socket.on("connect_error", (err: any) => finish({ connected: false, errorMessage: err?.message }));
    setTimeout(() => finish({ connected: false, errorMessage: "timeout" }), 6000);
  });
}

test("IAM002-T06: a Vendor socket connection is rejected after the token version changes", async () => {
  await mongoose.connect(process.env.DATABASE_URL as string);
  const vendor = await makeVendor("4");
  await mongoose.disconnect();

  const oldToken = await loginVendor(vendor.phone, "GapTest4#2026");

  const beforeConnect = await connectSocket(oldToken);
  assert.equal(beforeConnect.connected, true, `socket should connect with a fresh token, got error: ${beforeConnect.errorMessage}`);

  // Change the password to bump tokenVersion (gap 2's fix), then try the old token again.
  const otp = await seedOtp(vendor.email as string, vendor.phone);
  await fetch(`${API}/vendors/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: vendor.email, otp, newPassword: "NewGapTest4#2026" }),
  });

  const afterConnect = await connectSocket(oldToken);
  assert.equal(afterConnect.connected, false, "socket must reject the old token after tokenVersion changed");
});

test("IAM002-T07: a MeatCenter socket connection is rejected after the token version changes", async () => {
  await mongoose.connect(process.env.DATABASE_URL as string);
  const center = await makeMeatCenter("3");
  await mongoose.disconnect();

  const oldToken = await loginMeatCenter(center.phone, "GapTest3#2026");

  const beforeConnect = await connectSocket(oldToken);
  assert.equal(beforeConnect.connected, true, `socket should connect with a fresh token, got error: ${beforeConnect.errorMessage}`);

  await fetch(`${API}/meat/${center._id}`, {
    method: "PUT",
    headers: { ...authed(adminToken), "Content-Type": "application/json" },
    body: JSON.stringify({ password: "AdminSetGapTest3#2026" }),
  });

  const afterConnect = await connectSocket(oldToken);
  assert.equal(afterConnect.connected, false, "socket must reject the old token after an admin password update");
});

// --- Sanity: valid current tokens still work everywhere ---------------------

test("IAM002-T08: a freshly-issued Vendor token still works, both REST and socket", async () => {
  await mongoose.connect(process.env.DATABASE_URL as string);
  const vendor = await makeVendor("5");
  await mongoose.disconnect();

  const token = await loginVendor(vendor.phone, "GapTest5#2026");
  const restRes = await fetch(`${API}/vendors/me`, { headers: authed(token) });
  assert.equal(restRes.status, 200, "fresh vendor token should work over REST");

  const socketResult = await connectSocket(token);
  assert.equal(socketResult.connected, true, `fresh vendor token should connect over socket, got error: ${socketResult.errorMessage}`);
});

test("IAM002-T09: a freshly-issued MeatCenter token still works, both REST and socket", async () => {
  await mongoose.connect(process.env.DATABASE_URL as string);
  const center = await makeMeatCenter("4");
  await mongoose.disconnect();

  const token = await loginMeatCenter(center.phone, "GapTest4#2026");
  const restRes = await fetch(`${API}/vendors/me`, { headers: authed(token) });
  assert.ok(restRes.status === 200, `fresh meat-centre token should work over REST, got ${restRes.status}`);

  const socketResult = await connectSocket(token);
  assert.equal(socketResult.connected, true, `fresh meat-centre token should connect over socket, got error: ${socketResult.errorMessage}`);
});
