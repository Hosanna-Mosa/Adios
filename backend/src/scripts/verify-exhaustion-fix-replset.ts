// One-off, manually-run verification that the RBAC-004 exhaustion fix is
// correct end-to-end, for BOTH reproduced scenarios from the 2026-10-31
// consolidated audit: a dispatch session exhausted by every candidate
// declining, and one exhausted by the last offer timing out for real (not
// simulated — this script genuinely waits out the live 16s OFFER_TIMEOUT_MS
// in dispatch.manager.ts, since that's a different code path worth proving
// directly, not just assumed identical to the decline path). Needs MongoDB
// transactions (acceptOrder's sequential-dispatch branch), which the
// standard isolated test database (standalone, no replica set) cannot run —
// same limitation IDOR-T04 and the original RBAC-004 verification hit. Run
// against the throwaway single-node replica-set instance:
//
//   DATABASE_URL="mongodb://localhost:27118/projectx_iam_rbac_test?replicaSet=rs-iam-test" \
//     npx ts-node --transpile-only src/scripts/verify-exhaustion-fix-replset.ts
//
// Not wired into npm run test:iam-rbac, for the same reason the earlier
// replica-set scripts aren't — it needs this specific non-default
// environment, and scenario B deliberately takes ~16 real seconds.
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
    phone: `9000098${suffix}`,
    email: `exhaustion-verify-${suffix}@test.local`,
    name: `Exhaustion Verify Driver ${suffix}`,
    role: UserRole.DRIVER,
    password: "VerifyTest#2026",
  } as any);
  await user.save();
  const driver = new Driver({
    user: user._id,
    vehicleType: "bike",
    vehicleNumber: `VERIFY-EXHAUST-${suffix}`,
    status: DriverStatus.ONLINE,
    isAvailable: true,
    onboardingStatus: "completed",
  } as any);
  await driver.save();
  return { userId: (user._id as any).toString(), driverId: (driver._id as any).toString() };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  assertReplsetEnv();
  await mongoose.connect(process.env.DATABASE_URL as string);

  await Order.deleteMany({ _id: { $regex: /^VERIFY-EXHAUST-/ } });
  await Driver.deleteMany({ vehicleNumber: { $regex: /^VERIFY-EXHAUST-/ } });
  await User.deleteMany({ phone: { $regex: /^9000098/ } });

  const customer = await User.findOne({ phone: "9000000001" });
  if (!customer) throw new Error("Seeded test user 9000000001 not found in this DB — run seed-iam-test-accounts.ts against it first");

  const candidateA = await makeDriver("1");
  const candidateB = await makeDriver("2");
  const attacker = await makeDriver("3");

  let failures = 0;
  function check(label: string, cond: boolean) {
    console.log(`${cond ? "PASS" : "FAIL"} - ${label}`);
    if (!cond) failures++;
  }

  function makeOrderDoc(id: string) {
    return new Order({
      _id: id,
      user: customer!._id,
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
  }

  // --- Scenario A: every candidate declines, then an unrelated driver tries to accept ---
  {
    const order = makeOrderDoc("VERIFY-EXHAUST-01");
    await order.save();

    await dispatchManager.startDispatch(
      order._id.toString(),
      [
        { driverId: candidateA.driverId, driverUserId: candidateA.userId, distanceMeters: 500 },
        { driverId: candidateB.driverId, driverUserId: candidateB.userId, distanceMeters: 900 },
      ],
      { customerUserId: customer._id.toString() }
    );

    await ordersService.declineOrder(order._id.toString(), candidateA.userId, "decline 1 of 2");
    await ordersService.declineOrder(order._id.toString(), candidateB.userId, "decline 2 of 2 — exhausts the list");

    const afterDeclines = await Order.findById(order._id).lean();
    check("Scenario A: searchExhaustedAt set after every candidate declines", !!afterDeclines!.searchExhaustedAt);

    let rejected = false;
    let message = "";
    try {
      await ordersService.acceptOrder(order._id.toString(), attacker.userId);
    } catch (e: any) {
      rejected = true;
      message = e.message;
    }
    check("Scenario A: an unrelated driver's accept after exhaustion is rejected", rejected);
    check(`Scenario A: correct message ("Order is no longer available"), got "${message}"`, message === "Order is no longer available");

    const reloaded = await Order.findById(order._id).lean();
    check("Scenario A: order.driver still unset after the rejected attempt", !reloaded!.driver);
  }

  // --- Scenario B: the real offer timer expires (no decline at all), then an unrelated driver tries to accept ---
  {
    const order = makeOrderDoc("VERIFY-EXHAUST-02");
    await order.save();

    await dispatchManager.startDispatch(
      order._id.toString(),
      [{ driverId: candidateA.driverId, driverUserId: candidateA.userId, distanceMeters: 500 }],
      { customerUserId: customer._id.toString() }
    );

    console.log("Scenario B: waiting out the real ~16s offer timeout (no decline, no accept)...");
    await sleep(17000);

    const afterTimeout = await Order.findById(order._id).lean();
    check("Scenario B: searchExhaustedAt set after the real offer timeout expires", !!afterTimeout!.searchExhaustedAt);

    let rejected = false;
    let message = "";
    try {
      await ordersService.acceptOrder(order._id.toString(), attacker.userId);
    } catch (e: any) {
      rejected = true;
      message = e.message;
    }
    check("Scenario B: an unrelated driver's accept after a real timeout is rejected", rejected);
    check(`Scenario B: correct message ("Order is no longer available"), got "${message}"`, message === "Order is no longer available");

    // The original candidate shouldn't be able to sneak in after exhaustion either.
    let candidateRejected = false;
    try {
      await ordersService.acceptOrder(order._id.toString(), candidateA.userId);
    } catch (e: any) {
      candidateRejected = true;
    }
    check("Scenario B: even the original (now-expired) candidate is rejected after exhaustion", candidateRejected);
  }

  await Order.deleteMany({ _id: { $regex: /^VERIFY-EXHAUST-/ } });
  await Driver.deleteMany({ vehicleNumber: { $regex: /^VERIFY-EXHAUST-/ } });
  await User.deleteMany({ phone: { $regex: /^9000098/ } });
  await mongoose.disconnect();

  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("Script error:", e);
  process.exit(1);
});
