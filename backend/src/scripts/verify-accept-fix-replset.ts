// One-off, manually-run verification that orders.service.ts's acceptOrder
// fix is correct end-to-end: rejects an unauthorized driver, accepts the
// legitimate candidate, and the new atomic Order.findOneAndUpdate claim
// actually prevents a second acceptance of the same order. This needs
// MongoDB transactions (acceptOrder's sequential-dispatch branch wraps its
// writes in a session), which the standard isolated test database (a
// standalone instance, no replica set) cannot run — same limitation
// IDOR-T04 hit. Run against the throwaway single-node replica-set instance:
//
//   DATABASE_URL="mongodb://localhost:27118/projectx_iam_rbac_test?replicaSet=rs-iam-test" \
//     npx ts-node --transpile-only src/scripts/verify-accept-fix-replset.ts
//
// Not wired into npm run test:iam-rbac, for the same reason IDOR-T04 isn't —
// it needs this specific non-default environment.
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { SocketManager } from "../sockets/socket.manager";
import User, { UserRole } from "../database/models/User";
import Driver, { DriverStatus } from "../database/models/Driver";
import Order, { OrderStatus, ServiceType, StopType } from "../database/models/Order";
import { OrdersService } from "../modules/orders/orders.service";
import { dispatchManager } from "../services/dispatch.manager";

(SocketManager as unknown as { instance: unknown }).instance = {
  isUserConnected: () => true,
  emitToDriver: () => {},
  emitToUser: () => {},
  emitToOrderRoom: () => {},
  logConnectionStatus: () => {},
};

const ordersService = new OrdersService();

function assertReplsetEnv() {
  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl.includes("27118") || !dbUrl.includes("iam_rbac_test")) {
    throw new Error(`Refusing to run — this needs the throwaway replica-set DB (port 27118), got: ${dbUrl || "(unset)"}`);
  }
}

async function makeDriver(suffix: string) {
  const user = new User({
    phone: `9000099${suffix}`,
    email: `accept-verify-${suffix}@test.local`,
    name: `Accept Verify Driver ${suffix}`,
    role: UserRole.DRIVER,
    password: "VerifyTest#2026",
  } as any);
  await user.save();
  const driver = new Driver({
    user: user._id,
    vehicleType: "bike",
    vehicleNumber: `VERIFY-ACCEPT-${suffix}`,
    status: DriverStatus.ONLINE,
    isAvailable: true,
    onboardingStatus: "completed",
  } as any);
  await driver.save();
  return { userId: (user._id as any).toString(), driverId: (driver._id as any).toString() };
}

async function main() {
  assertReplsetEnv();
  await mongoose.connect(process.env.DATABASE_URL as string);

  await Order.deleteMany({ _id: { $regex: /^VERIFY-ACCEPT-/ } });
  await Driver.deleteMany({ vehicleNumber: { $regex: /^VERIFY-ACCEPT-/ } });
  await User.deleteMany({ phone: { $regex: /^9000099/ } });

  const customer = await User.findOne({ phone: "9000000001" });
  if (!customer) throw new Error("Seeded test user 9000000001 not found in this DB — run seed-iam-test-accounts.ts against it first");

  const candidateA = await makeDriver("51");
  const attacker = await makeDriver("52");
  const lateDriver = await makeDriver("53");
  const candidateC = await makeDriver("54"); // fresh driver for Scenario 2, since candidateA becomes unavailable after Scenario 1's successful accept

  let failures = 0;
  function check(label: string, cond: boolean) {
    console.log(`${cond ? "PASS" : "FAIL"} - ${label}`);
    if (!cond) failures++;
  }

  // --- Scenario 1: unauthorized accept is rejected ---
  {
    const order = new Order({
      _id: "VERIFY-ACCEPT-01",
      user: customer._id,
      status: OrderStatus.SEARCHING_DRIVER,
      serviceType: ServiceType.DELIVERY,
      paymentMethod: "cash",
      totalPrice: 100,
      priceBreakdown: { baseFare: 40, distanceFare: 40, timeFare: 20, surgeMultiplier: 1, total: 100 },
      stops: [
        { sequence: 1, type: StopType.PICKUP, address: "Verify Pickup", location: { type: "Point", coordinates: [78.48, 17.38] } },
        { sequence: 2, type: StopType.DROP, address: "Verify Drop", location: { type: "Point", coordinates: [78.49, 17.39] } },
      ],
    } as any);
    await order.save();

    await dispatchManager.startDispatch(
      order._id.toString(),
      [{ driverId: candidateA.driverId, driverUserId: candidateA.userId, distanceMeters: 500 }],
      { customerUserId: customer._id.toString() }
    );

    let rejected = false;
    let rejectMessage = "";
    try {
      await ordersService.acceptOrder(order._id.toString(), attacker.userId);
    } catch (e: any) {
      rejected = true;
      rejectMessage = e.message;
    }
    check("Scenario 1: unauthorized accept throws", rejected);
    check(`Scenario 1: correct message ("You were not offered this order"), got "${rejectMessage}"`, rejectMessage === "You were not offered this order");

    const reloaded = await Order.findById(order._id).lean();
    check("Scenario 1: order.driver still unset after rejected attempt", !reloaded!.driver);
    check("Scenario 1: order.status still SEARCHING_DRIVER after rejected attempt", reloaded!.status === OrderStatus.SEARCHING_DRIVER);

    // The real candidate should still be able to accept afterward.
    // acceptOrder returns a populated order, so `.driver` is a full Driver
    // document here, not a plain id — compare its _id.
    const legitOrder: any = await ordersService.acceptOrder(order._id.toString(), candidateA.userId);
    check(
      "Scenario 1: legitimate candidate's accept succeeds after the attack attempt",
      String(legitOrder.driver?._id ?? legitOrder.driver) === candidateA.driverId
    );
  }

  // --- Scenario 2: second accept on an already-claimed order is rejected (atomicity) ---
  {
    const order = new Order({
      _id: "VERIFY-ACCEPT-02",
      user: customer._id,
      status: OrderStatus.SEARCHING_DRIVER,
      serviceType: ServiceType.DELIVERY,
      paymentMethod: "cash",
      totalPrice: 100,
      priceBreakdown: { baseFare: 40, distanceFare: 40, timeFare: 20, surgeMultiplier: 1, total: 100 },
      stops: [
        { sequence: 1, type: StopType.PICKUP, address: "Verify Pickup 2", location: { type: "Point", coordinates: [78.48, 17.38] } },
        { sequence: 2, type: StopType.DROP, address: "Verify Drop 2", location: { type: "Point", coordinates: [78.49, 17.39] } },
      ],
    } as any);
    await order.save();

    await dispatchManager.startDispatch(
      order._id.toString(),
      [{ driverId: candidateC.driverId, driverUserId: candidateC.userId, distanceMeters: 500 }],
      { customerUserId: customer._id.toString() }
    );

    const firstAccept: any = await ordersService.acceptOrder(order._id.toString(), candidateC.userId);
    check(
      "Scenario 2: first (legitimate) accept succeeds",
      String(firstAccept.driver?._id ?? firstAccept.driver) === candidateC.driverId
    );

    // Simulate a late/stale accept arriving after the order is already assigned —
    // handleDriverAccept would say "no session" (true) for this driver since the
    // session was already deleted by the first accept, so the atomic DB-level
    // guard (not the in-memory check) must be what stops this.
    let secondRejected = false;
    let secondMessage = "";
    try {
      await ordersService.acceptOrder(order._id.toString(), lateDriver.userId);
    } catch (e: any) {
      secondRejected = true;
      secondMessage = e.message;
    }
    check("Scenario 2: second accept on an already-claimed order is rejected", secondRejected);
    check(`Scenario 2: correct message ("Order is no longer available"), got "${secondMessage}"`, secondMessage === "Order is no longer available");

    const reloaded = await Order.findById(order._id).lean();
    check("Scenario 2: order.driver still the FIRST driver, not overwritten", String(reloaded!.driver) === candidateC.driverId);
  }

  await Order.deleteMany({ _id: { $regex: /^VERIFY-ACCEPT-/ } });
  await Driver.deleteMany({ vehicleNumber: { $regex: /^VERIFY-ACCEPT-/ } });
  await User.deleteMany({ phone: { $regex: /^9000099/ } });
  await mongoose.disconnect();

  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("Script error:", e);
  process.exit(1);
});
