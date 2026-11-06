// IAM / RBAC / token / API security test suite for the dedicated testing
// assignment. Integration tests against a REAL running instance of this
// backend, pointed at the isolated `projectx_iam_rbac_test` database (never
// the real `projectx` database — see TESTING_REPORT/00_GIT_AND_ENVIRONMENT_SAFETY.md).
//
// Requires the backend to already be running (npm run dev) against that
// isolated database before `npm run test:iam-rbac` — deliberately kept out
// of the default `npm test` (which needs nothing running, see CLAUDE.md),
// same pattern as this project's existing test:digilocker script.
// Uses the fixed test accounts created by src/scripts/seed-iam-test-accounts.ts
// and src/scripts/seed-admin.ts.
import { test, before } from "node:test";
import assert from "node:assert/strict";

const BASE = process.env.IAM_TEST_BASE_URL || "http://localhost:3000";
const API = `${BASE}/api/v1`;

type LoginResult = { token: string; userId: string };

async function loginUser(phone: string, password: string, role: string): Promise<LoginResult> {
  const res = await fetch(`${API}/auth/login-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password, role }),
  });
  const body = await res.json();
  assert.equal(res.status, 200, `login for ${phone} (${role}) should succeed, got ${res.status}: ${JSON.stringify(body)}`);
  return { token: body.token, userId: body.user._id };
}

async function loginVendor(phone: string, password: string): Promise<LoginResult> {
  const res = await fetch(`${API}/vendors/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });
  const body = await res.json();
  assert.equal(res.status, 200, `vendor login for ${phone} should succeed, got ${res.status}: ${JSON.stringify(body)}`);
  return { token: body.token, userId: body._id };
}

function authed(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// Fixed test accounts (isolated DB only — see seed-iam-test-accounts.ts / seed-admin.ts)
const ACCOUNTS = {
  admin: { phone: "9999999999", password: "admin123", role: "ADMIN" },
  user: { phone: "9000000001", password: "TestUser#2026", role: "USER" },
  user2: { phone: "9000000003", password: "TestUser2#2026", role: "USER" },
  driver: { phone: "9000000002", password: "TestDriver#2026", role: "DRIVER" },
  support: { phone: "9000000004", password: "TestSupport#2026", role: "SUPPORT" },
  vendor: { phone: "9000000005", password: "TestVendor#2026" },
  vendor2: { phone: "9000000006", password: "TestVendor2#2026" },
};

// --- Phase B: authentication & token lifecycle -----------------------------

test("IAM-T01: valid login succeeds for every role", async () => {
  const admin = await loginUser(ACCOUNTS.admin.phone, ACCOUNTS.admin.password, ACCOUNTS.admin.role);
  const user = await loginUser(ACCOUNTS.user.phone, ACCOUNTS.user.password, ACCOUNTS.user.role);
  const driver = await loginUser(ACCOUNTS.driver.phone, ACCOUNTS.driver.password, ACCOUNTS.driver.role);
  const support = await loginUser(ACCOUNTS.support.phone, ACCOUNTS.support.password, ACCOUNTS.support.role);
  const vendor = await loginVendor(ACCOUNTS.vendor.phone, ACCOUNTS.vendor.password);
  for (const r of [admin, user, driver, support, vendor]) {
    assert.ok(r.token && r.token.length > 20, "token should be a real JWT string");
  }
});

test("IAM-T02: wrong password is rejected with a generic message (no account enumeration)", async () => {
  const wrongPwRes = await fetch(`${API}/auth/login-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: ACCOUNTS.user.phone, password: "WrongPassword123", role: "USER" }),
  });
  const nonExistentRes = await fetch(`${API}/auth/login-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: "9000099999", password: "Whatever123", role: "USER" }),
  });
  const wrongPwBody = await wrongPwRes.json();
  const nonExistentBody = await nonExistentRes.json();
  assert.equal(wrongPwRes.status, 401);
  assert.equal(nonExistentRes.status, 401);
  assert.equal(wrongPwBody.message, nonExistentBody.message, "wrong-password and no-such-account must return the identical message");
});

test("IAM-T03: protected endpoint rejects requests with no token", async () => {
  const res = await fetch(`${API}/users/addresses`);
  assert.equal(res.status, 401);
});

test("IAM-T04: protected endpoint rejects a malformed/tampered token", async () => {
  const { token } = await loginUser(ACCOUNTS.user.phone, ACCOUNTS.user.password, "USER");
  const tampered = token.slice(0, -4) + "xxxx";
  const res = await fetch(`${API}/users/addresses`, { headers: authed(tampered) });
  assert.equal(res.status, 401);
});

test("IAM-T05: logout revokes that specific token; reuse is rejected", async () => {
  const { token } = await loginUser(ACCOUNTS.user.phone, ACCOUNTS.user.password, "USER");
  const before = await fetch(`${API}/users/addresses`, { headers: authed(token) });
  assert.equal(before.status, 200, "token should work before logout");

  const logoutRes = await fetch(`${API}/auth/logout`, { method: "POST", headers: authed(token) });
  assert.equal(logoutRes.status, 200);

  const after = await fetch(`${API}/users/addresses`, { headers: authed(token) });
  assert.equal(after.status, 401, "the SAME token must be rejected after logout");
});

test("IAM-T06: logout-all invalidates every previously issued token for that user", async () => {
  const session1 = await loginUser(ACCOUNTS.user.phone, ACCOUNTS.user.password, "USER");
  const session2 = await loginUser(ACCOUNTS.user.phone, ACCOUNTS.user.password, "USER");
  assert.notEqual(session1.token, session2.token, "two separate logins must mint two distinct tokens");

  const logoutAllRes = await fetch(`${API}/auth/logout-all`, { method: "POST", headers: authed(session1.token) });
  assert.equal(logoutAllRes.status, 200);

  const check1 = await fetch(`${API}/users/addresses`, { headers: authed(session1.token) });
  const check2 = await fetch(`${API}/users/addresses`, { headers: authed(session2.token) });
  assert.equal(check1.status, 401, "session1 token must die after logout-all");
  assert.equal(check2.status, 401, "session2 token (a DIFFERENT device/login) must also die after logout-all");
});

test("IAM-T07 [bug check]: changing password should invalidate previously issued tokens", async () => {
  const oldSession = await loginUser(ACCOUNTS.user.phone, ACCOUNTS.user.password, "USER");
  const before = await fetch(`${API}/users/addresses`, { headers: authed(oldSession.token) });
  assert.equal(before.status, 200);

  const changeRes = await fetch(`${API}/users/change-password`, {
    method: "POST",
    headers: { ...authed(oldSession.token), "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword: ACCOUNTS.user.password, newPassword: "NewTestUser#2026" }),
  });
  assert.equal(changeRes.status, 200, `password change should succeed: ${JSON.stringify(await changeRes.clone().json())}`);

  try {
    const after = await fetch(`${API}/users/addresses`, { headers: authed(oldSession.token) });
    // EXPECTATION per security requirement: old token should now be 401.
    // Recorded here as the actual observed status — see TESTING_REPORT/02_FINDINGS_REGISTER.md (IAM-001).
    assert.equal(after.status, 401, "old token must stop working after a password change (IAM-001)");
  } finally {
    // Always revert, even if the assertion above failed, so later tests see the original password.
    const newLogin = await loginUser(ACCOUNTS.user.phone, "NewTestUser#2026", "USER");
    await fetch(`${API}/users/change-password`, {
      method: "POST",
      headers: { ...authed(newLogin.token), "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: "NewTestUser#2026", newPassword: ACCOUNTS.user.password }),
    });
  }
});

test("IAM-T08 [bug check]: a blocked user's active session should die immediately, not just future logins", async () => {
  const admin = await loginUser(ACCOUNTS.admin.phone, ACCOUNTS.admin.password, "ADMIN");
  const victim = await loginUser(ACCOUNTS.user2.phone, ACCOUNTS.user2.password, "USER");

  const before = await fetch(`${API}/users/addresses`, { headers: authed(victim.token) });
  assert.equal(before.status, 200);

  const blockRes = await fetch(`${API}/admin/users/${victim.userId}`, {
    method: "PUT",
    headers: { ...authed(admin.token), "Content-Type": "application/json" },
    body: JSON.stringify({ isBlocked: true }),
  });
  assert.equal(blockRes.status, 200, `admin block should succeed: ${JSON.stringify(await blockRes.clone().json())}`);

  try {
    const after = await fetch(`${API}/users/addresses`, { headers: authed(victim.token) });
    assert.equal(after.status, 401, "blocked user's existing token must stop working immediately");
  } finally {
    await fetch(`${API}/admin/users/${victim.userId}`, {
      method: "PUT",
      headers: { ...authed(admin.token), "Content-Type": "application/json" },
      body: JSON.stringify({ isBlocked: false }),
    });
  }
});

test("IAM-T09 [bug check]: vendor password change should invalidate previously issued vendor tokens", async () => {
  const oldSession = await loginVendor(ACCOUNTS.vendor.phone, ACCOUNTS.vendor.password);
  const before = await fetch(`${API}/vendors/me`, { headers: authed(oldSession.token) });
  assert.equal(before.status, 200, `vendor /me should work before change: ${before.status}`);

  const changeRes = await fetch(`${API}/vendors/change-password`, {
    method: "PUT",
    headers: { ...authed(oldSession.token), "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword: ACCOUNTS.vendor.password, newPassword: "NewTestVendor#2026" }),
  });
  assert.equal(changeRes.status, 200, `vendor password change should succeed: ${JSON.stringify(await changeRes.clone().json())}`);

  try {
    const after = await fetch(`${API}/vendors/me`, { headers: authed(oldSession.token) });
    assert.equal(after.status, 401, "old vendor token must stop working after vendor password change (IAM-002)");
  } finally {
    const newLogin = await loginVendor(ACCOUNTS.vendor.phone, "NewTestVendor#2026");
    await fetch(`${API}/vendors/change-password`, {
      method: "PUT",
      headers: { ...authed(newLogin.token), "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: "NewTestVendor#2026", newPassword: ACCOUNTS.vendor.password }),
    });
  }
});

test("IAM-T10 [bug check]: a rejected/disabled vendor's active session should die immediately", async () => {
  const admin = await loginUser(ACCOUNTS.admin.phone, ACCOUNTS.admin.password, "ADMIN");
  const vendorSession = await loginVendor(ACCOUNTS.vendor2.phone, ACCOUNTS.vendor2.password);

  const before = await fetch(`${API}/vendors/me`, { headers: authed(vendorSession.token) });
  assert.equal(before.status, 200);

  const rejectRes = await fetch(`${API}/vendors/${vendorSession.userId}`, {
    method: "PUT",
    headers: { ...authed(admin.token), "Content-Type": "application/json" },
    body: JSON.stringify({ onboardingStatus: "rejected" }),
  });
  assert.equal(rejectRes.status, 200, `admin reject-vendor should succeed: ${JSON.stringify(await rejectRes.clone().json())}`);

  try {
    const after = await fetch(`${API}/vendors/me`, { headers: authed(vendorSession.token) });
    assert.equal(after.status, 401, "a just-rejected vendor's existing token must stop working immediately (IAM-002)");
  } finally {
    await fetch(`${API}/vendors/${vendorSession.userId}`, {
      method: "PUT",
      headers: { ...authed(admin.token), "Content-Type": "application/json" },
      body: JSON.stringify({ onboardingStatus: "approved" }),
    });
  }
});

// --- Phase C: RBAC role boundaries ------------------------------------------

test("RBAC-T01: non-admin roles are denied on admin-only endpoints (403)", async () => {
  const driver = await loginUser(ACCOUNTS.driver.phone, ACCOUNTS.driver.password, "DRIVER");
  const user = await loginUser(ACCOUNTS.user.phone, ACCOUNTS.user.password, "USER");
  const support = await loginUser(ACCOUNTS.support.phone, ACCOUNTS.support.password, "SUPPORT");

  for (const [label, token] of [["driver", driver.token], ["user", user.token], ["support", support.token]] as const) {
    const res = await fetch(`${API}/admin/users`, { headers: authed(token) });
    assert.equal(res.status, 403, `${label} token must get 403 on admin-only /admin/users`);
  }
});

test("RBAC-T02: admin can reach admin-only endpoints (200)", async () => {
  const admin = await loginUser(ACCOUNTS.admin.phone, ACCOUNTS.admin.password, "ADMIN");
  const res = await fetch(`${API}/admin/users`, { headers: authed(admin.token) });
  assert.equal(res.status, 200);
});

test("RBAC-T03: support can reach shared admin+support endpoints, but not admin-only ones", async () => {
  const support = await loginUser(ACCOUNTS.support.phone, ACCOUNTS.support.password, "SUPPORT");
  const ticketsRes = await fetch(`${API}/admin/tickets`, { headers: authed(support.token) });
  assert.equal(ticketsRes.status, 200, "support should reach shared admin+support endpoint");

  const usersRes = await fetch(`${API}/admin/users`, { headers: authed(support.token) });
  assert.equal(usersRes.status, 403, "support must NOT reach admin-only /admin/users");

  const configRes = await fetch(`${API}/admin/config`, { headers: authed(support.token) });
  assert.equal(configRes.status, 403, "support must NOT reach admin-only /admin/config");
});

test("RBAC-T04: driver-only endpoints reject user/support/admin tokens", async () => {
  const user = await loginUser(ACCOUNTS.user.phone, ACCOUNTS.user.password, "USER");
  const support = await loginUser(ACCOUNTS.support.phone, ACCOUNTS.support.password, "SUPPORT");
  const admin = await loginUser(ACCOUNTS.admin.phone, ACCOUNTS.admin.password, "ADMIN");

  for (const [label, token] of [["user", user.token], ["support", support.token], ["admin", admin.token]] as const) {
    const res = await fetch(`${API}/drivers/profile`, { headers: authed(token) });
    assert.equal(res.status, 403, `${label} token must get 403 on driver-only /drivers/profile`);
  }
});

test("RBAC-T05: driver-only endpoint accepts a real driver token (200)", async () => {
  const driver = await loginUser(ACCOUNTS.driver.phone, ACCOUNTS.driver.password, "DRIVER");
  const res = await fetch(`${API}/drivers/profile`, { headers: authed(driver.token) });
  assert.equal(res.status, 200);
});

test("RBAC-T06: a vendor's own-resource endpoint scopes strictly to that vendor (resource isolation / IDOR check)", async () => {
  const v1 = await loginVendor(ACCOUNTS.vendor.phone, ACCOUNTS.vendor.password);
  const v2 = await loginVendor(ACCOUNTS.vendor2.phone, ACCOUNTS.vendor2.password);

  const v1Me = await fetch(`${API}/vendors/me`, { headers: authed(v1.token) });
  const v1Body = await v1Me.json();
  assert.equal(v1Body._id, v1.userId, "vendor /me must return this vendor's own id, never another's");

  const v2Me = await fetch(`${API}/vendors/me`, { headers: authed(v2.token) });
  const v2Body = await v2Me.json();
  assert.notEqual(v2Body._id, v1.userId, "vendor2's /me must never return vendor1's id");
});

test("RBAC-T07: a vendor token cannot use the admin-only vendor-update route on another vendor's record", async () => {
  const v1 = await loginVendor(ACCOUNTS.vendor.phone, ACCOUNTS.vendor.password);
  const v2 = await loginVendor(ACCOUNTS.vendor2.phone, ACCOUNTS.vendor2.password);
  // Vendor tokens are not UserRole.ADMIN, so authorizeRole([ADMIN]) should block this outright.
  const res = await fetch(`${API}/vendors/${v2.userId}`, {
    method: "PUT",
    headers: { ...authed(v1.token), "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Hijacked Name" }),
  });
  assert.equal(res.status, 403, "a vendor token must never be able to call the admin-only vendor-update route");
});
