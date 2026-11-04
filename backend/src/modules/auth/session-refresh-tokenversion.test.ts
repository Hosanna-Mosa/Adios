// Regression tests for the merge-conflict resolution between IAM-002
// (tokenVersion-based session invalidation for Vendor/MeatCenter) and dev's
// new rotating refresh-token system (session.service.ts, PR #46 merge with
// dev on 2026-11-04). Neither branch knew about the other's feature:
// dev's generateToken()/session.service.ts never threaded tokenVersion
// through for vendor-role subjects, which would have (a) broken fresh
// refresh-flow logins for any vendor whose tokenVersion is nonzero (tv
// defaults to 0, immediately rejected by auth.middleware's tv check), and
// (b) left resolveSubject()'s refresh-time revalidation blind to
// tokenVersion for Vendor/MeatCenter, unlike the existing User-role branch.
// Run via `npm run test:iam-rbac` (needs a live backend — IAM_TEST_BASE_URL).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import Vendor from "../../database/models/Vendor";
import MeatCenter from "../../database/models/MeatCenter";

const API = (process.env.IAM_TEST_BASE_URL || "http://localhost:3000") + "/api/v1";

function assertIsolatedTestEnvironment() {
  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl.includes("iam_rbac_test")) {
    throw new Error(`Refusing to run — DATABASE_URL does not look like the isolated test DB: ${dbUrl || "(unset)"}`);
  }
}

async function makeVendor(suffix: string) {
  const vendor = new Vendor({
    name: `Session Refresh Test Vendor ${suffix}`,
    email: `session-refresh-${suffix}@test.local`,
    phone: `900009960${suffix}`,
    password: "SessionRefresh#2026",
    partnerType: "food",
    onboardingStatus: "approved",
    address: "Session Refresh Test Address",
    location: { type: "Point", coordinates: [78.48, 17.38] },
  } as any);
  await vendor.save();
  return vendor;
}

async function makeMeatCenter(suffix: string) {
  const center = new MeatCenter({
    name: `Session Refresh Test MeatCenter ${suffix}`,
    email: `session-refresh-meat-${suffix}@test.local`,
    phone: `900009961${suffix}`,
    password: "SessionRefresh#2026",
    location: { type: "Point", coordinates: [78.48, 17.38] },
    address: "Session Refresh Test Address",
    isOpen: true,
  } as any);
  await center.save();
  return center;
}

function decodeTv(token: string): number {
  const payload = jwt.decode(token) as any;
  return payload?.tv ?? -1;
}

before(async () => {
  assertIsolatedTestEnvironment();
  await mongoose.connect(process.env.DATABASE_URL as string);
  await Vendor.deleteMany({ email: { $regex: /^session-refresh-/ } });
  await MeatCenter.deleteMany({ email: { $regex: /^session-refresh-meat-/ } });
});

after(async () => {
  await Vendor.deleteMany({ email: { $regex: /^session-refresh-/ } });
  await MeatCenter.deleteMany({ email: { $regex: /^session-refresh-meat-/ } });
  await mongoose.disconnect();
});

test("SESSION-T01: Vendor login via the refresh-flow mints an access token carrying the real tokenVersion", async () => {
  const vendor = await makeVendor("1");
  const res = await fetch(`${API}/vendors/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-auth-refresh": "1" },
    body: JSON.stringify({ email: vendor.email, password: "SessionRefresh#2026" }),
  });
  assert.equal(res.status, 200, "login should succeed");
  const body: any = await res.json();
  assert.ok(body.token, "refresh-flow login must still return an access token");
  assert.ok(body.refreshToken, "refresh-flow login must return a refresh token");
  assert.equal(decodeTv(body.token), 0, "a fresh vendor's access token should carry tokenVersion 0, not a default/garbage value");
});

test("SESSION-T02: Vendor login via the plain (non-refresh) flow also carries the real tokenVersion", async () => {
  const vendor = await makeVendor("2");
  const res = await fetch(`${API}/vendors/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: vendor.email, password: "SessionRefresh#2026" }),
  });
  assert.equal(res.status, 200);
  const body: any = await res.json();
  assert.ok(body.token);
  assert.equal(body.refreshToken, undefined, "the plain flow must not mint a refresh token");
  assert.equal(decodeTv(body.token), 0);
});

test("SESSION-T03: MeatCenter login via the refresh-flow mints an access token carrying the real tokenVersion", async () => {
  const center = await makeMeatCenter("1");
  const res = await fetch(`${API}/meat/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-auth-refresh": "1" },
    body: JSON.stringify({ email: center.email, password: "SessionRefresh#2026" }),
  });
  assert.equal(res.status, 200);
  const body: any = await res.json();
  assert.ok(body.token);
  assert.ok(body.refreshToken);
  assert.equal(decodeTv(body.token), 0);
});

test("SESSION-T04: MeatCenter login via the plain flow also carries the real tokenVersion", async () => {
  const center = await makeMeatCenter("2");
  const res = await fetch(`${API}/meat/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: center.email, password: "SessionRefresh#2026" }),
  });
  assert.equal(res.status, 200);
  const body: any = await res.json();
  assert.ok(body.token);
  assert.equal(decodeTv(body.token), 0);
});

test("SESSION-T05: a normal Vendor refresh rotation succeeds and the new access token still carries the right tokenVersion", async () => {
  const vendor = await makeVendor("3");
  const login = await fetch(`${API}/vendors/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-auth-refresh": "1" },
    body: JSON.stringify({ email: vendor.email, password: "SessionRefresh#2026" }),
  });
  const { refreshToken } = (await login.json()) as any;

  const refreshed = await fetch(`${API}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  assert.equal(refreshed.status, 200, "a valid, unused refresh token must successfully rotate");
  const body: any = await refreshed.json();
  assert.ok(body.token, "refresh must return a new access token");
  assert.ok(body.refreshToken, "refresh must return the next refresh token in the family");
  assert.notEqual(body.refreshToken, refreshToken, "the refresh token must rotate, not stay the same");
  assert.equal(decodeTv(body.token), 0, "the newly-rotated access token must still carry the vendor's real tokenVersion");
});

test("SESSION-T06: after a Vendor changes their password, their OLD refresh token is rejected (IAM-002 parity for the new refresh-flow)", async () => {
  const vendor = await makeVendor("4");
  const login = await fetch(`${API}/vendors/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-auth-refresh": "1" },
    body: JSON.stringify({ email: vendor.email, password: "SessionRefresh#2026" }),
  });
  const { token, refreshToken } = (await login.json()) as any;

  const changed = await fetch(`${API}/vendors/change-password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ currentPassword: "SessionRefresh#2026", newPassword: "SessionRefreshNew#2026" }),
  });
  assert.equal(changed.status, 200, "password change itself should succeed");

  const refreshed = await fetch(`${API}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  assert.equal(refreshed.status, 401, `a refresh token issued before a password change must be rejected — got ${refreshed.status}`);
});

test("SESSION-T07: after an admin resets a MeatCenter's password, their OLD refresh token is rejected", async () => {
  // Uses the admin-driven PUT /meat/:id path, not the self-service PUT
  // /meat/change-password: that route is pre-existing-ly shadowed by the
  // earlier-registered PUT /meat/:id in meat.routes.ts (Express matches
  // "/change-password" as :id, hitting the admin-only updateMeatCenter
  // handler and 403ing) — a real bug, but unrelated to this merge, since the
  // same ordering already existed at the merge-base before either branch's
  // work. Reported separately; not fixed here (out of scope / different file).
  const center = await makeMeatCenter("3");
  const login = await fetch(`${API}/meat/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-auth-refresh": "1" },
    body: JSON.stringify({ email: center.email, password: "SessionRefresh#2026" }),
  });
  const { refreshToken } = (await login.json()) as any;

  const adminLogin = await fetch(`${API}/auth/login-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: "9999999999", password: "admin123", role: "ADMIN" }),
  });
  assert.equal(adminLogin.status, 200, "seeded admin login must succeed");
  const { token: adminToken } = (await adminLogin.json()) as any;

  const changed = await fetch(`${API}/meat/${center._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ password: "SessionRefreshNew#2026" }),
  });
  assert.equal(changed.status, 200, "admin password reset itself should succeed");

  const refreshed = await fetch(`${API}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  assert.equal(refreshed.status, 401, `a refresh token issued before a password change must be rejected — got ${refreshed.status}`);
});

test("SESSION-T08: a fresh Vendor login after a password change mints a token with the incremented tokenVersion, not a stale one", async () => {
  const vendor = await makeVendor("5");
  await fetch(`${API}/vendors/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: vendor.email, password: "SessionRefresh#2026" }),
  });

  const reloadedBefore = await Vendor.findById(vendor._id).lean();
  assert.equal(reloadedBefore!.tokenVersion ?? 0, 0, "tokenVersion should still be 0 before any password change");

  // Simulate the password-change trigger directly (already covered end-to-end
  // by SESSION-T06); just need tokenVersion to actually be nonzero here.
  await Vendor.updateOne({ _id: vendor._id }, { $set: { tokenVersion: 3 } });

  const login2 = await fetch(`${API}/vendors/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-auth-refresh": "1" },
    body: JSON.stringify({ email: vendor.email, password: "SessionRefresh#2026" }),
  });
  assert.equal(login2.status, 200);
  const body: any = await login2.json();
  assert.equal(decodeTv(body.token), 3, "a freshly-minted token must carry the CURRENT tokenVersion (3), not default to 0");
});

test("SESSION-T09: existing User-role refresh-token behavior is unaffected by this merge (regression)", async () => {
  const login = await fetch(`${API}/auth/login-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-auth-refresh": "1" },
    body: JSON.stringify({ phone: "9000000001", password: "TestUser#2026", role: "USER" }),
  });
  assert.equal(login.status, 200, "seeded test user login must still succeed");
  const body: any = await login.json();
  assert.ok(body.token);
  assert.ok(body.refreshToken);

  const refreshed = await fetch(`${API}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: body.refreshToken }),
  });
  assert.equal(refreshed.status, 200, "an existing User's refresh rotation must still succeed, unaffected by the Vendor/MeatCenter tokenVersion wiring");
});
