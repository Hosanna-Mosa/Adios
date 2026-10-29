// Dedicated regression tests for RBAC-003: a driver must not be able to
// decline an order they were never offered, and an unrelated driver must not
// be able to force-advance a sequential dispatch queue by declining out of
// turn. See TESTING_REPORT/02_FINDINGS_REGISTER.md for the original finding.
//
// Runs via direct service imports (no live backend process needed) because
// dispatch.manager's per-order session lives in that process's memory —
// starting a dispatch and then attempting a decline must happen in the same
// process. Still needs the isolated test database directly, same as the
// other iam-rbac-*.test.ts files — run via `npm run test:iam-rbac`, not
// `npm test`.
//
// dispatch.manager.ts's success path (a legitimate decline) reaches
// SocketManager, which only exists once the real backend has booted with an
// http.Server. A minimal in-process fake is installed below so the
// *legitimate*-decline assertions (which must go through that path to prove
// the queue actually advances) don't require a live server. The *rejected*
// path never reaches SocketManager at all — RBAC-003's fix is an early,
// read-only check — so those assertions don't depend on the fake either way.
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
    throw new Error(
      `Refusing to run — DATABASE_URL does not look like the isolated test DB: ${dbUrl || "(unset)"}`
    );
  }
}

// Minimal fake so handleDriverDecline's success path (SocketManager.emitToDriver,
// offerNextDriver's isUserConnected check) doesn't need a real Socket.IO server.
(SocketManager as unknown as { instance: unknown }).instance = {
  isUserConnected: () => true,
  emitToDriver: () => {},
  emitToUser: () => {},
};

async function makeDriver(suffix: string) {
  const user = new User({
    phone: `90000999${suffix}`,
    email: `rbac003-driver-${suffix}@test.local`,
    name: `RBAC-003 Test Driver ${suffix}`,
    role: UserRole.DRIVER,
    password: "RbacTest#2026",
  } as any);
  await user.save();
  const driver = new Driver({
    user: user._id,
    vehicleType: "bike",
    vehicleNumber: `RBAC003-${suffix}`,
    status: DriverStatus.ONLINE,
    isAvailable: true,
    onboardingStatus: "completed",
  } as any);
  await driver.save();
  return { userId: (user._id as any).toString(), driverId: (driver._id as any).toString() };
}

async function makeOrder(id: string, userDocId: mongoose.Types.ObjectId, extra: Record<string, unknown> = {}) {
  const order = new Order({
    _id: id,
    user: userDocId,
    status: OrderStatus.SEARCHING_DRIVER,
    serviceType: ServiceType.DELIVERY,
    paymentMethod: "cash",
    totalPrice: 100,
    priceBreakdown: { baseFare: 40, distanceFare: 40, timeFare: 20, surgeMultiplier: 1, total: 100 },
    stops: [
      { sequence: 1, type: StopType.PICKUP, address: "RBAC-003 Pickup", location: { type: "Point", coordinates: [78.48, 17.38] } },
      { sequence: 2, type: StopType.DROP, address: "RBAC-003 Drop", location: { type: "Point", coordinates: [78.49, 17.39] } },
    ],
    ...extra,
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

  // Idempotent cleanup: a previous interrupted run may have left fixtures behind.
  await Order.deleteMany({ _id: { $regex: /^RBAC003-/ } });
  await Driver.deleteMany({ vehicleNumber: { $regex: /^RBAC003-/ } });
  await User.deleteMany({ phone: { $regex: /^90000999/ } });

  const customer = await User.findOne({ phone: "9000000001" });
  if (!customer) throw new Error("Seeded test user 9000000001 not found — run seed-iam-test-accounts.ts first");
  customerUserDocId = customer._id as any;

  candidateA = await makeDriver("1");
  candidateB = await makeDriver("2");
  attacker = await makeDriver("3");
});

after(async () => {
  dispatchManager.cancelDispatch("RBAC003-SEQ-01");
  dispatchManager.cancelDispatch("RBAC003-SEQ-02");
  await Order.deleteMany({ _id: { $regex: /^RBAC003-/ } });
  await Driver.deleteMany({ vehicleNumber: { $regex: /^RBAC003-/ } });
  await User.deleteMany({ phone: { $regex: /^90000999/ } });
  await mongoose.disconnect();
});

// --- Part 1: sequential dispatch — declining out of turn must not advance the queue ---

test("RBAC-003-T01: a driver who is NOT the current candidate cannot decline a sequential-dispatch order", async () => {
  const order = await makeOrder("RBAC003-SEQ-01", customerUserDocId);

  await dispatchManager.startDispatch(
    order._id.toString(),
    [
      { driverId: candidateA.driverId, driverUserId: candidateA.userId, distanceMeters: 500 },
      { driverId: candidateB.driverId, driverUserId: candidateB.userId, distanceMeters: 900 },
    ],
    { customerUserId: customerUserDocId.toString() }
  );

  // attacker was never offered this order — only candidateA is the current candidate.
  await ordersService.declineOrder(order._id.toString(), attacker.userId, "attacker trying to decline");

  const afterAttack = await Order.findById(order._id).lean();
  assert.deepEqual(afterAttack!.declineReasons ?? [], [], "an out-of-turn decline must not be recorded in declineReasons");

  // Prove the queue did NOT advance: candidateA must still be able to decline
  // successfully as the (still) current candidate.
  await ordersService.declineOrder(order._id.toString(), candidateA.userId, "legit decline after attack attempt");
  const afterLegit = await Order.findById(order._id).lean();
  assert.equal(afterLegit!.declineReasons?.length, 1, "the legitimate candidate's decline should be the only recorded entry");
  assert.equal(afterLegit!.declineReasons?.[0].driverId, candidateA.driverId);
  assert.equal(afterLegit!.declineReasons?.[0].reason, "legit decline after attack attempt", "the real reason text must be preserved, not overwritten");
});

test("RBAC-003-T02: the legitimate current candidate CAN decline, and the queue correctly advances to the next candidate", async () => {
  const order = await makeOrder("RBAC003-SEQ-02", customerUserDocId);

  await dispatchManager.startDispatch(
    order._id.toString(),
    [
      { driverId: candidateA.driverId, driverUserId: candidateA.userId, distanceMeters: 500 },
      { driverId: candidateB.driverId, driverUserId: candidateB.userId, distanceMeters: 900 },
    ],
    { customerUserId: customerUserDocId.toString() }
  );

  assert.equal(dispatchManager.isCurrentCandidate(order._id.toString(), candidateA.userId), true, "candidateA should start as the current candidate");
  assert.equal(dispatchManager.isCurrentCandidate(order._id.toString(), candidateB.userId), false, "candidateB should not be the current candidate yet");

  await ordersService.declineOrder(order._id.toString(), candidateA.userId, "legit decline");
  const afterFirst = await Order.findById(order._id).lean();
  assert.equal(afterFirst!.declineReasons?.length, 1, "candidateA's decline should be recorded");

  // The queue should have advanced to candidateB.
  assert.equal(dispatchManager.isCurrentCandidate(order._id.toString(), candidateB.userId), true, "candidateB should now be the current candidate");

  await ordersService.declineOrder(order._id.toString(), candidateB.userId, "second legit decline");
  const afterSecond = await Order.findById(order._id).lean();
  assert.equal(afterSecond!.declineReasons?.length, 2, "candidateB's decline should also be recorded once they become the current candidate");
});

// --- Part 2: an order with no active dispatch session at all ---

test("RBAC-003-T03: a driver cannot decline an order with no active dispatch session (random/stale/finished order id)", async () => {
  const order = await makeOrder("RBAC003-NOSESSION-01", customerUserDocId, { status: OrderStatus.DELIVERED });
  // Deliberately never call startDispatch — no active session exists for this order.

  await ordersService.declineOrder(order._id.toString(), attacker.userId, "attacker trying to decline an unrelated/finished order");

  const reloaded = await Order.findById(order._id).lean();
  assert.deepEqual(reloaded!.declineReasons ?? [], [], "declining an order with no active dispatch session must not be recorded");
});

// --- Part 3: broadcast (food) dispatch — existing offer-matching behavior preserved, both ways ---

test("RBAC-003-T04: a driver who was never offered a broadcast (food) order cannot decline it", async () => {
  const order = await makeOrder("RBAC003-BCAST-01", customerUserDocId, {
    dispatchMode: "broadcast",
    dispatch: {
      state: "searching",
      offers: [{ driverUserId: candidateA.userId, driverId: candidateA.driverId, offeredAt: new Date(), outcome: "offered" }],
    },
  });

  await ordersService.declineOrder(order._id.toString(), attacker.userId, "attacker trying to decline a broadcast order they were never offered");

  const reloaded = await Order.findById(order._id).lean();
  assert.deepEqual(reloaded!.declineReasons ?? [], [], "a non-offered driver's decline on a broadcast order must not be recorded");
  assert.equal(reloaded!.dispatch?.offers?.[0]?.outcome, "offered", "the real offer must be untouched by the attacker's attempt");
});

test("RBAC-003-T05: a driver who WAS offered a broadcast (food) order CAN decline it (existing correct behavior preserved)", async () => {
  const order = await makeOrder("RBAC003-BCAST-02", customerUserDocId, {
    dispatchMode: "broadcast",
    dispatch: {
      state: "searching",
      offers: [{ driverUserId: candidateA.userId, driverId: candidateA.driverId, offeredAt: new Date(), outcome: "offered" }],
    },
  });

  await ordersService.declineOrder(order._id.toString(), candidateA.userId, "legit broadcast decline");

  const reloaded = await Order.findById(order._id).lean();
  assert.equal(reloaded!.declineReasons?.length, 1, "a legitimately offered driver's decline must still be recorded");
  assert.equal(reloaded!.declineReasons?.[0].reason, "legit broadcast decline");
  assert.equal(reloaded!.dispatch?.offers?.[0]?.outcome, "declined", "the real offer's outcome should flip to declined");
});
