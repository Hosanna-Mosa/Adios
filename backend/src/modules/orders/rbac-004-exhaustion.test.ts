// Dedicated regression tests for the RBAC-004 reopened gap found during the
// 2026-10-31 IAM/RBAC consolidated audit: once a sequential dispatch session
// is exhausted (every candidate declines or times out), the in-memory
// session is deleted but the order was left at status: SEARCHING_DRIVER,
// driver: null — identical to an order that was never dispatched at all —
// so any driver (not just a former candidate) could accept it. See
// TESTING_REPORT/02_FINDINGS_REGISTER.md for the full writeup.
//
// This file covers the fast, non-transactional part: that exhaustion
// correctly persists searchExhaustedAt, the signal acceptOrder's fix relies
// on. It does NOT exercise acceptOrder's full rejection end-to-end, since
// that method wraps its write in a MongoDB transaction the standard
// standalone isolated test database can't run — see
// verify-exhaustion-fix-replset.ts for that proof, against the same
// throwaway replica-set MongoDB used for the original RBAC-004 verification
// and for IDOR-T04. Run via `npm run test:iam-rbac`, not `npm test`.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { SocketManager } from "../../sockets/socket.manager";
import User, { UserRole } from "../../database/models/User";
import Driver, { DriverStatus } from "../../database/models/Driver";
import Order, { OrderStatus, ServiceType, StopType } from "../../database/models/Order";
import { OrdersService } from "./orders.service";
import { dispatchManager } from "../../services/dispatch.manager";

const ordersService = new OrdersService();

function assertIsolatedTestEnvironment() {
  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl.includes("iam_rbac_test")) {
    throw new Error(`Refusing to run — DATABASE_URL does not look like the isolated test DB: ${dbUrl || "(unset)"}`);
  }
}

(SocketManager as unknown as { instance: unknown }).instance = {
  isUserConnected: () => true,
  emitToDriver: () => {},
  emitToUser: () => {},
};

async function makeDriver(suffix: string) {
  const user = new User({
    phone: `90000995${suffix}`,
    email: `rbac004-exhaustion-${suffix}@test.local`,
    name: `RBAC-004 Exhaustion Test Driver ${suffix}`,
    role: UserRole.DRIVER,
    password: "ExhaustTest#2026",
  } as any);
  await user.save();
  const driver = new Driver({
    user: user._id,
    vehicleType: "bike",
    vehicleNumber: `EXHAUST${suffix}`,
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
      { sequence: 1, type: StopType.PICKUP, address: "Exhaustion Test Pickup", location: { type: "Point", coordinates: [78.48, 17.38] } },
      { sequence: 2, type: StopType.DROP, address: "Exhaustion Test Drop", location: { type: "Point", coordinates: [78.49, 17.39] } },
    ],
  } as any);
  await order.save();
  return order;
}

let customerUserDocId: mongoose.Types.ObjectId;
let candidateA: { userId: string; driverId: string };

before(async () => {
  assertIsolatedTestEnvironment();
  await mongoose.connect(process.env.DATABASE_URL as string);

  await Order.deleteMany({ _id: { $regex: /^EXHAUST-/ } });
  await Driver.deleteMany({ vehicleNumber: { $regex: /^EXHAUST/ } });
  await User.deleteMany({ phone: { $regex: /^90000995/ } });

  const customer = await User.findOne({ phone: "9000000001" });
  if (!customer) throw new Error("Seeded test user 9000000001 not found — run seed-iam-test-accounts.ts first");
  customerUserDocId = customer._id as any;

  candidateA = await makeDriver("1");
});

after(async () => {
  dispatchManager.cancelDispatch("EXHAUST-01");
  await Order.deleteMany({ _id: { $regex: /^EXHAUST-/ } });
  await Driver.deleteMany({ vehicleNumber: { $regex: /^EXHAUST/ } });
  await User.deleteMany({ phone: { $regex: /^90000995/ } });
  await mongoose.disconnect();
});

test("RBAC004-EXH-T01: searchExhaustedAt starts null on a fresh sequential-dispatch order", async () => {
  const order = await makeOrder("EXHAUST-01", customerUserDocId);
  assert.equal(order.searchExhaustedAt, null, "a freshly-created order should not already be marked exhausted");
});

test("RBAC004-EXH-T02: once the only candidate declines, dispatch exhausts and searchExhaustedAt is set", async () => {
  const order = await makeOrder("EXHAUST-02", customerUserDocId);

  await dispatchManager.startDispatch(
    order._id.toString(),
    [{ driverId: candidateA.driverId, driverUserId: candidateA.userId, distanceMeters: 500 }],
    { customerUserId: customerUserDocId.toString() }
  );

  // Only candidate declines — this is the same code path (offerNextDriver's
  // exhaustion branch) a real 16s offer timeout funnels through too; both are
  // covered end-to-end in verify-exhaustion-fix-replset.ts.
  await ordersService.declineOrder(order._id.toString(), candidateA.userId, "declining to trigger exhaustion");

  const reloaded = await Order.findById(order._id).lean();
  assert.ok(reloaded!.searchExhaustedAt, "searchExhaustedAt should be set once the candidate list is exhausted");

  // The in-memory session should also be gone, confirming the vulnerable
  // "no session" state this fix specifically targets has actually been reached.
  assert.equal(
    dispatchManager.isCurrentCandidate(order._id.toString(), candidateA.userId),
    false,
    "the dispatch session should no longer exist after exhaustion"
  );
});

test("RBAC004-EXH-T03: a legitimate, still-active dispatch is unaffected — searchExhaustedAt stays null", async () => {
  const order = await makeOrder("EXHAUST-03", customerUserDocId);

  await dispatchManager.startDispatch(
    order._id.toString(),
    [{ driverId: candidateA.driverId, driverUserId: candidateA.userId, distanceMeters: 500 }],
    { customerUserId: customerUserDocId.toString() }
  );

  const reloaded = await Order.findById(order._id).lean();
  assert.equal(reloaded!.searchExhaustedAt, null, "an order with a live, unexhausted dispatch session must not be marked exhausted");

  dispatchManager.cancelDispatch(order._id.toString());
});
