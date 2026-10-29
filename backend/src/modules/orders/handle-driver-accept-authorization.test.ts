// Dedicated regression tests for the handleDriverAccept follow-up found
// during RBAC-003 investigation: a driver who is not the current sequential-
// dispatch candidate must not be able to accept the order. See
// TESTING_REPORT/02_FINDINGS_REGISTER.md for the full writeup.
//
// startDispatch's internal offerNextDriver touches SocketManager
// (isUserConnected/emitToDriver) the same way decline's success path does,
// so this file installs the same minimal in-process fake as
// rbac-003.decline-authorization.test.ts for the same reason. Needs the
// isolated test database directly — run via `npm run test:iam-rbac`, not
// `npm test`.
//
// This file covers the in-memory authorization gate only. The companion
// end-to-end check — that orders.service.ts's acceptOrder actually rejects
// an unauthorized caller and that the new atomic Order.findOneAndUpdate
// claim is race-safe — needs MongoDB transactions, which the standard
// isolated test database (standalone, no replica set) cannot run. That
// check was run manually against the same throwaway single-node replica-set
// MongoDB instance used earlier for IDOR-T04 (see
// TESTING_REPORT/02_FINDINGS_REGISTER.md's "Environment limitation" entry)
// and is documented separately, not wired into this automated suite, for
// the same reason IDOR-T04 isn't.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { SocketManager } from "../../sockets/socket.manager";
import User, { UserRole } from "../../database/models/User";
import Driver, { DriverStatus } from "../../database/models/Driver";
import Order, { OrderStatus, ServiceType, StopType } from "../../database/models/Order";
import { dispatchManager } from "../../services/dispatch.manager";

function assertIsolatedTestEnvironment() {
  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl.includes("iam_rbac_test")) {
    throw new Error(
      `Refusing to run — DATABASE_URL does not look like the isolated test DB: ${dbUrl || "(unset)"}`
    );
  }
}

(SocketManager as unknown as { instance: unknown }).instance = {
  isUserConnected: () => true,
  emitToDriver: () => {},
  emitToUser: () => {},
};

async function makeDriver(suffix: string) {
  const user = new User({
    phone: `90000998${suffix}`,
    email: `accept-test-driver-${suffix}@test.local`,
    name: `Accept Test Driver ${suffix}`,
    role: UserRole.DRIVER,
    password: "AcceptTest#2026",
  } as any);
  await user.save();
  const driver = new Driver({
    user: user._id,
    vehicleType: "bike",
    vehicleNumber: `ACCEPTTEST${suffix}`,
    status: DriverStatus.ONLINE,
    isAvailable: true,
    onboardingStatus: "completed",
  } as any);
  await driver.save();
  return { userId: (user._id as any).toString(), driverId: (driver._id as any).toString() };
}

async function makeOrder(id: string, userDocId: mongoose.Types.ObjectId) {
  const order = new Order({
    _id: id,
    user: userDocId,
    status: OrderStatus.SEARCHING_DRIVER,
    serviceType: ServiceType.DELIVERY,
    paymentMethod: "cash",
    totalPrice: 100,
    priceBreakdown: { baseFare: 40, distanceFare: 40, timeFare: 20, surgeMultiplier: 1, total: 100 },
    stops: [
      { sequence: 1, type: StopType.PICKUP, address: "Accept Test Pickup", location: { type: "Point", coordinates: [78.48, 17.38] } },
      { sequence: 2, type: StopType.DROP, address: "Accept Test Drop", location: { type: "Point", coordinates: [78.49, 17.39] } },
    ],
  } as any);
  await order.save();
  return order;
}

let customerUserDocId: mongoose.Types.ObjectId;
let candidateA: { userId: string; driverId: string };
let candidateB: { userId: string; driverId: string };
let attacker: { userId: string; driverId: string };

before(async () => {
  assertIsolatedTestEnvironment();
  await mongoose.connect(process.env.DATABASE_URL as string);

  await Order.deleteMany({ _id: { $regex: /^ACCEPTTEST-/ } });
  await Driver.deleteMany({ vehicleNumber: { $regex: /^ACCEPTTEST/ } });
  await User.deleteMany({ phone: { $regex: /^90000998/ } });

  const customer = await User.findOne({ phone: "9000000001" });
  if (!customer) throw new Error("Seeded test user 9000000001 not found — run seed-iam-test-accounts.ts first");
  customerUserDocId = customer._id as any;

  candidateA = await makeDriver("1");
  candidateB = await makeDriver("2");
  attacker = await makeDriver("3");
});

after(async () => {
  dispatchManager.cancelDispatch("ACCEPTTEST-01");
  dispatchManager.cancelDispatch("ACCEPTTEST-02");
  dispatchManager.cancelDispatch("ACCEPTTEST-03");
  await Order.deleteMany({ _id: { $regex: /^ACCEPTTEST-/ } });
  await Driver.deleteMany({ vehicleNumber: { $regex: /^ACCEPTTEST/ } });
  await User.deleteMany({ phone: { $regex: /^90000998/ } });
  await mongoose.disconnect();
});

test("ACCEPT-T01: a driver who is NOT the current candidate cannot accept (handleDriverAccept returns false, session untouched)", async () => {
  const order = await makeOrder("ACCEPTTEST-01", customerUserDocId);

  await dispatchManager.startDispatch(
    order._id.toString(),
    [
      { driverId: candidateA.driverId, driverUserId: candidateA.userId, distanceMeters: 500 },
      { driverId: candidateB.driverId, driverUserId: candidateB.userId, distanceMeters: 900 },
    ],
    { customerUserId: customerUserDocId.toString() }
  );

  const result = dispatchManager.handleDriverAccept(order._id.toString(), attacker.userId);
  assert.equal(result, false, "an unrelated driver's accept attempt must be rejected");

  // Prove the session is untouched: candidateA must still be the current
  // candidate, and their own accept must still succeed afterward.
  assert.equal(
    dispatchManager.isCurrentCandidate(order._id.toString(), candidateA.userId),
    true,
    "the real candidate must still be current after the attacker's rejected attempt"
  );
  const legitResult = dispatchManager.handleDriverAccept(order._id.toString(), candidateA.userId);
  assert.equal(legitResult, true, "the legitimate candidate's accept should still succeed after the attack attempt");
});

test("ACCEPT-T02: the legitimate current candidate CAN accept, and the session is cleaned up", async () => {
  const order = await makeOrder("ACCEPTTEST-02", customerUserDocId);

  await dispatchManager.startDispatch(
    order._id.toString(),
    [{ driverId: candidateA.driverId, driverUserId: candidateA.userId, distanceMeters: 500 }],
    { customerUserId: customerUserDocId.toString() }
  );

  assert.equal(dispatchManager.isCurrentCandidate(order._id.toString(), candidateA.userId), true);

  const result = dispatchManager.handleDriverAccept(order._id.toString(), candidateA.userId);
  assert.equal(result, true, "the legitimate candidate's accept should succeed");

  // Session is deleted on successful accept — isCurrentCandidate now returns
  // false for everyone, confirming cleanup happened (dispatch queue consistency).
  assert.equal(
    dispatchManager.isCurrentCandidate(order._id.toString(), candidateA.userId),
    false,
    "the session should be gone after a successful accept"
  );
});

test("ACCEPT-T03: accepting an order with no active dispatch session returns true (reserved-order case, not a bug)", () => {
  // No startDispatch call at all — mirrors a reserved order accepted
  // directly, which never goes through sequential dispatch.
  const result = dispatchManager.handleDriverAccept("ACCEPTTEST-03", attacker.userId);
  assert.equal(result, true, "no active session is a legitimate case (e.g. reserved orders) and must not be rejected");
});
