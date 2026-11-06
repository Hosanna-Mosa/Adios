// IDOR/BOLA, mass-assignment, and role-escalation tests for the IAM/RBAC
// testing assignment. Same isolated test backend/database as
// iam-rbac-security.test.ts. Requires the test backend already running.
import { test, before } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User, { UserRole } from "../../database/models/User";
import Driver, { DriverStatus } from "../../database/models/Driver";
import Order, { OrderStatus, ServiceType, StopType } from "../../database/models/Order";

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
  user: { phone: "9000000001", password: "TestUser#2026", role: "USER" },
  user2: { phone: "9000000003", password: "TestUser2#2026", role: "USER" },
  driver: { phone: "9000000002", password: "TestDriver#2026", role: "DRIVER" },
  driver2: { phone: "9000000007", password: "TestDriver2#2026", role: "DRIVER" },
};

let fixtureOrderId: string;
let driver1Id: string;
let driver2Id: string;

before(async () => {
  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl.includes("iam_rbac_test")) {
    throw new Error(`Refusing to run — DATABASE_URL does not look like the isolated test DB: ${dbUrl}`);
  }
  await mongoose.connect(dbUrl);

  // Ensure driver2 test account exists (not created by the earlier seed script).
  let driver2User = await User.findOne({ phone: ACCOUNTS.driver2.phone });
  if (!driver2User) {
    driver2User = new User({
      phone: ACCOUNTS.driver2.phone,
      email: "iam-test-driver-2@test.local",
      name: "IAM Test Driver Two",
      role: UserRole.DRIVER,
      password: ACCOUNTS.driver2.password,
    } as any);
    await driver2User.save();
  }

  // Ensure Driver profile documents exist for both drivers (created via onboarding in the real app).
  const user1 = await User.findOne({ phone: ACCOUNTS.driver.phone });
  let driver1 = await Driver.findOne({ user: user1!._id });
  if (!driver1) {
    driver1 = new Driver({ user: user1!._id, vehicleType: "bike", vehicleNumber: "TEST-001", status: DriverStatus.ONLINE, isAvailable: true, onboardingStatus: "completed" } as any);
    await driver1.save();
  }
  let driver2 = await Driver.findOne({ user: driver2User._id });
  if (!driver2) {
    driver2 = new Driver({ user: driver2User._id, vehicleType: "bike", vehicleNumber: "TEST-002", status: DriverStatus.ONLINE, isAvailable: true, onboardingStatus: "completed" } as any);
    await driver2.save();
  }
  driver1Id = (driver1._id as any).toString();
  driver2Id = (driver2._id as any).toString();

  // Fixture order: belongs to test user, assigned to driver1, cash payment, cancellable status.
  const user1Account = await User.findOne({ phone: ACCOUNTS.user.phone });
  const existing = await Order.findById("ORD-IDOR-TEST-1");
  if (existing) await Order.deleteOne({ _id: "ORD-IDOR-TEST-1" });
  const order = new Order({
    _id: "ORD-IDOR-TEST-1",
    user: user1Account!._id,
    driver: driver1._id,
    status: OrderStatus.DRIVER_ASSIGNED,
    serviceType: ServiceType.DELIVERY,
    paymentMethod: "cash",
    totalPrice: 150,
    priceBreakdown: { baseFare: 50, distanceFare: 80, timeFare: 20, surgeMultiplier: 1, total: 150 },
    stops: [
      { sequence: 1, type: StopType.PICKUP, address: "Test Pickup", location: { type: "Point", coordinates: [78.48, 17.38] } },
      { sequence: 2, type: StopType.DROP, address: "Test Drop", location: { type: "Point", coordinates: [78.49, 17.39] } },
    ],
  } as any);
  await order.save();
  fixtureOrderId = "ORD-IDOR-TEST-1";

  await mongoose.disconnect();
});

// --- IDOR / BOLA -------------------------------------------------------------

test("IDOR-T01: a driver cannot confirm cash-collected on an order assigned to a DIFFERENT driver", async () => {
  const driver2 = await loginUser(ACCOUNTS.driver2.phone, ACCOUNTS.driver2.password, "DRIVER");
  const res = await fetch(`${API}/orders/${fixtureOrderId}/cash-collected`, {
    method: "POST",
    headers: { ...authed(driver2.token), "Content-Type": "application/json" },
    body: JSON.stringify({ amount: 150 }),
  });
  // The service conceals existence rather than revealing "this order belongs to someone else".
  assert.equal(res.status, 404, `driver2 must not be able to act on driver1's order (IDOR) — got ${res.status}`);
});

test("IDOR-T02 [fixed]: decline is rejected (403) when the caller was never offered this order", async () => {
  // RBAC-003 follow-up fix: declineOrder (orders.service.ts:1914) used to
  // silently return the order unchanged when the caller wasn't the current
  // dispatch candidate, which gave an unauthorized decline attempt an HTTP
  // 200 — indistinguishable from success. It now throws "You were not
  // offered this order", which orders.controller.ts's decline() maps to 403,
  // the same pattern acceptOrder already used. See 02_FINDINGS_REGISTER.md
  // (RBAC-003) for the original finding.
  const driver2 = await loginUser(ACCOUNTS.driver2.phone, ACCOUNTS.driver2.password, "DRIVER");
  const res = await fetch(`${API}/orders/${fixtureOrderId}/decline`, {
    method: "POST",
    headers: { ...authed(driver2.token), "Content-Type": "application/json" },
    body: JSON.stringify({ reason: "test" }),
  });
  assert.equal(res.status, 403, `an unauthorized decline attempt must be rejected with 403, not succeed — got ${res.status}`);
});

test("IDOR-T03: a different customer cannot cancel another customer's order", async () => {
  const otherCustomer = await loginUser(ACCOUNTS.user2.phone, ACCOUNTS.user2.password, "USER");
  const res = await fetch(`${API}/orders/${fixtureOrderId}/status`, {
    method: "PATCH",
    headers: { ...authed(otherCustomer.token), "Content-Type": "application/json" },
    body: JSON.stringify({ status: "CANCELLED" }),
  });
  assert.equal(res.status, 404, `a non-owning customer must not be able to touch this order — got ${res.status}`);
});

test("IDOR-T04: the actual owning customer CAN cancel their own order (sanity check; needs a replica-set MongoDB — see 02_FINDINGS_REGISTER.md)", async () => {
  const owner = await loginUser(ACCOUNTS.user.phone, ACCOUNTS.user.password, "USER");
  const res = await fetch(`${API}/orders/${fixtureOrderId}/status`, {
    method: "PATCH",
    headers: { ...authed(owner.token), "Content-Type": "application/json" },
    body: JSON.stringify({ status: "CANCELLED" }),
  });
  const body = await res.clone().json().catch(() => ({}));
  if (res.status === 500 && JSON.stringify(body).includes("Transaction numbers are only allowed on a replica set")) {
    // Environment limitation: this isolated test MongoDB is a standalone instance,
    // not a replica set, so Mongoose transactions (used by updateOrderStatus) can't
    // run here at all — this is NOT an application bug. Logged, not asserted as a
    // failure. See 06_PENDING_AND_BLOCKED.md.
    console.log("BLOCKED (environment): local test MongoDB has no replica set, transactional order-status updates cannot be exercised here.");
    return;
  }
  assert.equal(res.status, 200, `the actual owner should be able to cancel their own order — got ${res.status}: ${JSON.stringify(body)}`);
});

test("IDOR-T05: editing another user's saved address is impossible by construction (always scoped to the token's own user)", async () => {
  const owner = await loginUser(ACCOUNTS.user.phone, ACCOUNTS.user.password, "USER");
  const addRes = await fetch(`${API}/users/addresses`, {
    method: "POST",
    headers: { ...authed(owner.token), "Content-Type": "application/json" },
    body: JSON.stringify({ label: "Home", addressLine: "123 Test St" }),
  });
  const addBody = await addRes.json();
  assert.equal(addRes.status, 201, `add address should succeed: ${JSON.stringify(addBody)}`);
  const addressId = addBody[addBody.length - 1]._id;

  const attacker = await loginUser(ACCOUNTS.user2.phone, ACCOUNTS.user2.password, "USER");
  const editRes = await fetch(`${API}/users/addresses/${addressId}`, {
    method: "PATCH",
    headers: { ...authed(attacker.token), "Content-Type": "application/json" },
    body: JSON.stringify({ label: "Hijacked" }),
  });
  assert.equal(editRes.status, 404, `user2 editing user1's address id must 404 (scoped lookup, not a global one) — got ${editRes.status}`);

  // Cleanup
  await fetch(`${API}/users/addresses/${addressId}`, { method: "DELETE", headers: authed(owner.token) });
});

// --- Mass assignment / role escalation ---------------------------------------

test("MASS-T01: profile update cannot inject role, isBlocked, or tokenVersion via the request body", async () => {
  // Deliberately user2, not user1: user1's password is mutated mid-test by IAM-T07
  // in iam-rbac-security.test.ts, and when both files run as concurrent Node test-
  // runner workers, a shared account creates a real cross-file race condition. Not
  // an application bug — a test-fixture isolation issue, fixed by not sharing state.
  const user = await loginUser(ACCOUNTS.user2.phone, ACCOUNTS.user2.password, "USER");
  const res = await fetch(`${API}/users/profile`, {
    method: "PATCH",
    headers: { ...authed(user.token), "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Still A Test User", role: "ADMIN", isBlocked: false, tokenVersion: 999 }),
  });
  const body = await res.json();
  assert.equal(res.status, 200, `profile update itself should succeed: ${JSON.stringify(body)}`);
  assert.equal(body.role, "USER", "role must NOT be changeable via profile update");

  // Re-fetch via admin to be certain, not just trusting this response's echo.
  const checkRes = await fetch(`${API}/admin/users/${user.userId}`, { headers: authed((await loginUser("9999999999", "admin123", "ADMIN")).token) });
  const checkBody = await checkRes.json();
  assert.equal(checkBody.role ?? checkBody.user?.role, "USER", "role must still be USER in the database after the injection attempt");
});

test("MASS-T02: self-registration (OTP flow) cannot be used to mint an ADMIN or SUPPORT account", async () => {
  const freshPhone = "9000099988";
  await User.deleteOne({ phone: freshPhone }).catch(() => {});
  const res = await fetch(`${API}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: freshPhone, code: "123456", role: "ADMIN", name: "Attempted Admin", password: "Whatever#2026" }),
  });
  assert.notEqual(res.status, 200, `self-signup as ADMIN via OTP must be rejected — got ${res.status}: ${JSON.stringify(await res.clone().json())}`);
});
