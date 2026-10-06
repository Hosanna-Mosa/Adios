import mongoose from "mongoose";
import Order, { OrderStatus, ServiceType } from "../database/models/Order";
import type { IFoodOffer } from "../database/models/Order";
import Driver, { DriverStatus } from "../database/models/Driver";
import Vendor from "../database/models/Vendor";
import User from "../database/models/User";
import { SocketManager } from "../sockets/socket.manager";
import { NotificationService } from "./notification.service";
import { FOOD_BROADCAST_CONFIG, driverAcceptsServiceType } from "../config/dispatch.config";
import { ConflictError } from "../utils/errors";
import { DriverService } from "../modules/drivers/drivers.service";
import { driverPaymentInfo } from "../modules/orders/orders.payment";

/*
 * Finding a rider for a restaurant (food) order — the same flow as Lampose.
 *
 *   restaurant accepts + quotes a prep time → START HERE → first rider to accept gets it
 *
 * Rides, helper tasks, meat, package and scheduled orders keep the sequential, one
 * driver at a time dispatcher in dispatch.manager.ts. Only orders created with
 * `dispatchMode: "broadcast"` (see usesFoodBroadcast) come through this file.
 *
 * - The search starts when the RESTAURANT ACCEPTS, not when the customer orders.
 *   The prep time quoted on that accept is turned into a radius: every rider who
 *   can reach the restaurant before the food is ready is offered the order at the
 *   same moment, and the first to accept gets it. No per-driver countdown.
 * - Nobody in range yet? The radius grows twice: halfway through the prep time and
 *   again five minutes before the food is due. The restaurant marking the order
 *   ready runs a fresh search too, and an order still without a rider is searched
 *   again on a backoff, up to `maxSweeps` searches. After that the customer is told
 *   once and the order waits for a person (any offer still open stays open).
 * - `status` stays the order's main track (CREATED → SEARCHING_DRIVER →
 *   DRIVER_ASSIGNED → …) so every app keeps reading it as before. `dispatch.state`
 *   is the rider search alone, so "food is ready" never stops the search.
 * - Accepting is ONE atomic update. Two riders tapping at once: one gets it, the
 *   other is told it's gone. The timers below are only the widen schedule; the
 *   order document is the truth, so a restart loses nothing but timers, and the
 *   backstop sweep re-books those.
 */

const BADGE = "🛵 [FOOD DISPATCH]";
const cfg = FOOD_BROADCAST_CONFIG;
const METRES_PER_MINUTE = (cfg.planningSpeedKmh * 1000) / 60;
const WIDEN_STEP_METERS = cfg.widenStepMinutes * METRES_PER_MINUTE;

// A rider on one of these is carrying (or heading to) another order.
const NOT_BUSY_STATUSES = [
  OrderStatus.CREATED, OrderStatus.SEARCHING_DRIVER, OrderStatus.CONFIRMED,
  OrderStatus.COMPLETED, OrderStatus.DELIVERED, OrderStatus.DELIVERED_LC, OrderStatus.CANCELLED,
];
// A job untouched this long is a leftover, not something the rider is still on.
const BUSY_LOOKBACK_MS = 6 * 60 * 60 * 1000;

export interface FoodCandidate {
  driverId: string;
  driverUserId: string;
  distanceMeters: number;
  name?: string;
  phone?: string;
}

/* orderId -> pending widen timers. Holds nothing the order document doesn't. */
const sessions = new Map<string, { timers: NodeJS.Timeout[] }>();

const clearSession = (orderId: string) => {
  const session = sessions.get(orderId);
  if (session) session.timers.forEach(clearTimeout);
  sessions.delete(orderId);
};

export const radiusFromMinutes = (minutes?: number | null) =>
  Math.max(cfg.minRadiusMeters, (Number(minutes) || 0) * METRES_PER_MINUTE);

const riderEtaMinutes = (distanceMeters: number) => Math.round((Number(distanceMeters) || 0) / METRES_PER_MINUTE);

/** When the food will be ready: the restaurant's accept time plus its quote. */
export function readyAtFor(order: any): Date | null {
  if (!order?.prepMinutes || !order?.restaurantAcceptedAt) return null;
  return new Date(new Date(order.restaurantAcceptedAt).getTime() + order.prepMinutes * 60000);
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const pickupOf = (order: any): [number, number] | null => {
  const coords = order?.stops?.[0]?.location?.coordinates;
  return Array.isArray(coords) && coords.length >= 2 ? [Number(coords[0]), Number(coords[1])] : null;
};

/**
 * Whether a new order gets this flow: a delivery from a restaurant that signs in to
 * accept it. Meat outlets (partnerType "meat", legacy MeatCenters), package deliveries
 * (no vendor), scheduled and reserved orders keep the sequential dispatcher.
 */
export async function usesFoodBroadcast(
  serviceType: ServiceType,
  vendorId: string | undefined,
  opts: { scheduled: boolean; reserved: boolean },
): Promise<boolean> {
  if (serviceType !== ServiceType.DELIVERY || !vendorId || opts.scheduled || opts.reserved) return false;
  if (!mongoose.Types.ObjectId.isValid(vendorId)) return false;
  const vendor = await Vendor.findById(vendorId).select("partnerType").lean();
  return !!vendor && vendor.partnerType !== "meat";
}

/* ── Who can be offered it ────────────────────────────────────────────────── */

async function busyDriverIds(driverIds: mongoose.Types.ObjectId[]): Promise<Set<string>> {
  if (!driverIds.length) return new Set();
  const rows = await Order.find({
    driver: { $in: driverIds },
    status: { $nin: NOT_BUSY_STATUSES },
    updatedAt: { $gte: new Date(Date.now() - BUSY_LOOKBACK_MS) },
    // A reserved ride accepted for later doesn't make the rider busy now.
    $nor: [{ isReserved: true, reservedAt: { $gt: new Date() } }],
  }).select("driver").lean();
  return new Set(rows.map((row: any) => String(row.driver)));
}

/**
 * Every rider within `radiusMeters` of the pickup who could take a food order right
 * now, nearest first. Riders this order already offered (whatever they answered)
 * are excluded, so nobody is asked twice.
 */
async function findCandidates(order: any, radiusMeters: number, excludeUserIds: string[]): Promise<FoodCandidate[]> {
  const pickup = pickupOf(order);
  if (!pickup) return [];
  const [lng, lat] = pickup;

  let drivers: any[] = [];
  try {
    drivers = await Driver.find({
      status: DriverStatus.ONLINE,
      isAvailable: true,
      currentLocation: {
        $nearSphere: { $geometry: { type: "Point", coordinates: [lng, lat] }, $maxDistance: radiusMeters },
      },
    })
      .limit(cfg.maxBroadcast * 2)
      .populate("user");
  } catch (err: any) {
    console.error(`${BADGE} ${order._id} rider search failed at ${Math.round(radiusMeters)}m:`, err.message);
    return [];
  }

  const driversService = new DriverService();
  const excluded = new Set(excludeUserIds);

  drivers = drivers.filter((d: any) => d.user?._id && !excluded.has(d.user._id.toString()));
  // Same freshness and "food" toggle rules every other dispatch path applies.
  drivers = driversService.filterDriversWithLiveLocation(drivers, "food broadcast");
  drivers = drivers.filter((d: any) => driverAcceptsServiceType(d.activeServices, ServiceType.DELIVERY));

  // isAvailable is set back to true by every location ping, even mid-job, so the
  // rider's own orders are what say whether they're free.
  const busy = await busyDriverIds(drivers.map((d: any) => d._id));
  drivers = drivers.filter((d: any) => !busy.has(d._id.toString()));

  const dropoff = order.stops?.[order.stops.length - 1]?.location?.coordinates;
  const candidates: FoodCandidate[] = [];
  for (const d of drivers) {
    if (d.homeMode === true && dropoff) {
      let onTheWay = true;
      try {
        onTheWay = await driversService.isOrderOnTheWayToHome(d._id.toString(), [lng, lat], dropoff);
      } catch (err) {
        console.error(`${BADGE} home-mode check failed for driver ${d._id}; keeping as candidate:`, err);
      }
      if (!onTheWay) continue;
    }
    const coords = d.currentLocation?.coordinates || [];
    candidates.push({
      driverId: d._id.toString(),
      driverUserId: d.user._id.toString(),
      distanceMeters: Math.round(haversineMeters(lat, lng, Number(coords[1]), Number(coords[0]))),
      name: d.user?.name,
      phone: d.user?.phone,
    });
  }

  return candidates.sort((a, b) => a.distanceMeters - b.distanceMeters).slice(0, cfg.maxBroadcast);
}

/* ── What a rider is shown ────────────────────────────────────────────────── */

/** The offer card, in the same shape the driver app already reads for "new_order". */
async function offerPayload(order: any) {
  const [user, vendor] = await Promise.all([
    User.findById(order.user).select("name phone").lean(),
    order.vendor ? Vendor.findById(order.vendor).select("name phone").lean() : null,
  ]);
  const readyAt = readyAtFor(order);
  const totalDistance = Number(order.totalDistance) || 0;
  return {
    id: order._id,
    serviceType: order.serviceType,
    dispatchMode: "broadcast",
    distance: `${totalDistance} km`,
    duration: `${Math.max(1, Math.round((totalDistance / cfg.planningSpeedKmh) * 60))} min`,
    radius: order.radius,
    earnings: Math.round(order.totalPrice * 0.8),
    customerPrice: order.customerPrice,
    ...driverPaymentInfo(order),
    bookingFor: order.bookingFor,
    scheduledDelivery: order.scheduledDelivery,
    customerName: (user as any)?.name || "Customer",
    customerPhone: (user as any)?.phone || "N/A",
    vendorName: (vendor as any)?.name || "Restaurant",
    vendorPhone: (vendor as any)?.phone || "",
    status: "pending",
    timestamp: new Date(),
    restaurantPickupCode: order.restaurantPickupCode,
    isReserved: false,
    prepMinutes: order.prepMinutes,
    readyAt: readyAt ? readyAt.toISOString() : null,
    stops: (order.stops || []).map((s: any) => ({
      id: s._id,
      type: s.type.toLowerCase(),
      locationName: s.address?.split(",")[0],
      address: s.address,
      lat: s.location.coordinates[1],
      lng: s.location.coordinates[0],
      items: s.items,
    })),
  };
}

const withDistance = (base: any, distanceMeters: number) => ({
  ...base,
  distanceToPickupMeters: distanceMeters,
  etaMinutes: riderEtaMinutes(distanceMeters),
});

/** Socket + push to each candidate. The offers are already on the order. */
async function sendOffers(order: any, candidates: FoodCandidate[]) {
  if (!candidates.length) return;
  const base = await offerPayload(order);
  const socketManager = SocketManager.getInstance();
  const readyAt = readyAtFor(order);
  const readyInMin = readyAt ? Math.max(0, Math.round((readyAt.getTime() - Date.now()) / 60000)) : null;

  console.log(
    `${BADGE} ${order._id} → offering to ${candidates.length}: ` +
    candidates.map((c) => `${c.driverUserId}(${c.distanceMeters}m)`).join(", "),
  );

  for (const candidate of candidates) {
    socketManager?.emitToDriver(candidate.driverUserId, "new_order", withDistance(base, candidate.distanceMeters), "FoodDispatch.broadcast");
    NotificationService.getInstance()
      .sendNotification({
        userId: candidate.driverUserId,
        title: "New delivery nearby 🛵",
        body: `Earn ~₹${base.earnings}. ${readyInMin ? `Food ready in ${readyInMin} min. ` : "Food is ready. "}First to accept gets it.`,
        data: {
          orderId: order._id.toString(),
          type: "NEW_ORDER_OFFER",
          deepLink: { screen: "/(tabs)", params: { orderId: order._id.toString() } },
        },
      })
      .catch((err: any) => console.warn(`${BADGE} push to ${candidate.driverUserId} failed:`, err.message));
  }
}

/** Closes offers still open on an order and tells those riders. */
async function closeOpenOffers(order: any, outcome: "timeout" | "cancelled" | "superseded", exceptUserId?: string) {
  const open = (order.dispatch?.offers || []).filter(
    (o: IFoodOffer) => o.outcome === "offered" && o.driverUserId !== exceptUserId,
  );
  if (!open.length) return;
  await Order.updateOne(
    { _id: order._id },
    { $set: { "dispatch.offers.$[o].outcome": outcome, "dispatch.offers.$[o].respondedAt": new Date() } },
    { arrayFilters: [{ "o.outcome": "offered", ...(exceptUserId ? { "o.driverUserId": { $ne: exceptUserId } } : {}) }] },
  );
  const socketManager = SocketManager.getInstance();
  const reason = outcome === "superseded" ? "taken" : outcome;
  for (const offer of open) {
    socketManager?.emitToDriver(offer.driverUserId, "order_offer_expired", { orderId: order._id.toString(), reason }, "FoodDispatch.close");
  }
}

/* ── Searching ────────────────────────────────────────────────────────────── */

function scheduleWidening(order: any) {
  const readyAt = readyAtFor(order);
  const orderId = order._id.toString();
  const session = { timers: [] as NodeJS.Timeout[] };
  sessions.set(orderId, session);
  if (!readyAt) return;

  const remainingMs = readyAt.getTime() - Date.now();
  const halfway = remainingMs / 2;
  const final = remainingMs - cfg.finalCheckpointLeadMs;
  const delays: number[] = [];
  if (halfway > cfg.minCheckpointMs) delays.push(halfway);
  if (final > cfg.minCheckpointMs && Math.abs(final - halfway) > cfg.minCheckpointMs) delays.push(final);

  for (const delay of delays) {
    session.timers.push(
      setTimeout(() => {
        widen(orderId).catch((err) => console.error(`${BADGE} ${orderId} widen failed:`, err.message));
      }, delay),
    );
  }
}

/** Reach further, because nobody in range has taken it yet. Re-offers nobody. */
async function widen(orderId: string) {
  const order: any = await Order.findById(orderId);
  if (!order || order.dispatch?.state !== "searching" || order.status !== OrderStatus.SEARCHING_DRIVER || order.driver) return;

  const asked = (order.dispatch.offers || []).map((o: IFoodOffer) => o.driverUserId);
  const widerRadius = (order.dispatch.radiusMeters || radiusFromMinutes(order.prepMinutes)) + WIDEN_STEP_METERS;
  const candidates = await findCandidates(order, widerRadius, asked);

  const updated = await Order.findOneAndUpdate(
    { _id: order._id, "dispatch.state": "searching", status: OrderStatus.SEARCHING_DRIVER, driver: null },
    {
      $set: { "dispatch.radiusMeters": widerRadius, "dispatch.candidateCount": asked.length + candidates.length },
      $push: { "dispatch.offers": { $each: candidates.map((c) => newOffer(c)) } },
      $inc: { totalCandidatesCount: candidates.length },
    },
    { new: true },
  );
  if (!updated) return;

  console.log(`${BADGE} ${orderId} widened to ${(widerRadius / 1000).toFixed(1)}km — ${candidates.length} new rider(s)`);
  await sendOffers(updated, candidates);
}

const newOffer = (c: FoodCandidate): IFoodOffer => ({
  driverUserId: c.driverUserId,
  driverId: c.driverId,
  distanceMeters: c.distanceMeters,
  offeredAt: new Date(),
  outcome: "offered",
});

/**
 * Begin (or run again) the search for a food order. Called when the restaurant
 * accepts, when it marks the food ready, and by the backstop retry. Never throws:
 * every caller has already committed something that must not be undone by this.
 */
export async function startDispatch(orderId: string, reason = "accepted"): Promise<{ started: boolean; reason?: string }> {
  try {
    const order: any = await Order.findById(orderId);
    if (!order || order.dispatchMode !== "broadcast") return { started: false, reason: "not a food broadcast order" };
    if (order.status !== OrderStatus.SEARCHING_DRIVER) return { started: false, reason: `status is ${order.status}` };
    if (order.driver) return { started: false, reason: "already has a driver" };

    if ((order.dispatch?.attempts || 0) >= cfg.maxSweeps) {
      await giveUp(order);
      return { started: false, reason: "sweep limit reached" };
    }

    const asked = (order.dispatch?.offers || []).map((o: IFoodOffer) => o.driverUserId);
    // Never narrower than a widen step already reached.
    const radiusMeters = Math.max(radiusFromMinutes(order.prepMinutes), order.dispatch?.radiusMeters || 0);
    const candidates = await findCandidates(order, radiusMeters, asked);
    const stillOpen = (order.dispatch?.offers || []).filter((o: IFoodOffer) => o.outcome === "offered").length;
    const now = new Date();

    if (!candidates.length && !(order.dispatch?.state === "searching" && stillOpen)) {
      const failed: any = await Order.findOneAndUpdate(
        { _id: order._id, status: OrderStatus.SEARCHING_DRIVER, driver: null },
        {
          $set: {
            "dispatch.state": "unassigned",
            "dispatch.radiusMeters": radiusMeters,
            "dispatch.lastAttemptAt": now,
            "dispatch.failureReason": "No free rider nearby right now",
          },
          $min: { "dispatch.startedAt": now },
          $inc: { "dispatch.attempts": 1 },
        },
        { new: true },
      );
      clearSession(orderId);
      console.warn(`${BADGE} ${orderId} found nobody (${reason}) within ${(radiusMeters / 1000).toFixed(1)}km`);
      if (failed && (failed.dispatch?.attempts || 0) >= cfg.maxSweeps) await giveUp(failed);
      return { started: false, reason: "no candidates" };
    }

    const updated = await Order.findOneAndUpdate(
      { _id: order._id, status: OrderStatus.SEARCHING_DRIVER, driver: null },
      {
        $set: {
          "dispatch.state": "searching",
          "dispatch.radiusMeters": radiusMeters,
          "dispatch.lastAttemptAt": now,
          "dispatch.failureReason": "",
          "dispatch.candidateCount": asked.length + candidates.length,
        },
        $min: { "dispatch.startedAt": now },
        $inc: { "dispatch.attempts": 1, totalCandidatesCount: candidates.length },
        $push: { "dispatch.offers": { $each: candidates.map((c) => newOffer(c)) } },
      },
      { new: true },
    );
    if (!updated) return { started: false, reason: "order changed" };

    console.log(
      `${BADGE} ${orderId} searching (${reason}) · sweep ${updated.dispatch?.attempts}/${cfg.maxSweeps} · ` +
      `${candidates.length} new rider(s) within ${(radiusMeters / 1000).toFixed(1)}km` +
      (stillOpen ? ` · ${stillOpen} offer(s) still open` : ""),
    );

    clearSession(orderId);
    scheduleWidening(updated);
    await sendOffers(updated, candidates);
    return { started: true };
  } catch (err: any) {
    console.error(`${BADGE} ${orderId} could not start:`, err.message);
    return { started: false, reason: err.message };
  }
}

const FINAL_FAILURE = `No rider found after ${cfg.maxSweeps} searches`;

/**
 * Out of searches. Said once, to the customer, rather than left spinning. Offers
 * still open stay open — a rider who takes it late is still the best outcome — and
 * the order waits for a person (admin or the customer cancelling).
 */
async function giveUp(order: any) {
  if (order.dispatch?.failureReason === FINAL_FAILURE) return;
  await Order.updateOne({ _id: order._id }, { $set: { "dispatch.failureReason": FINAL_FAILURE } });

  console.error(
    `${BADGE} ⚠ ${order._id} has used all ${cfg.maxSweeps} searches and still has no rider. ` +
    "Somebody needs to call the customer or the restaurant.",
  );
  NotificationService.getInstance()
    .sendNotification({
      userId: order.user.toString(),
      title: "Still finding a delivery partner",
      body: "Riders near the restaurant are busy right now. Our team has been alerted and will help get your order to you.",
      type: "transactional",
      category: "order_status",
      data: { orderId: order._id, deepLink: { screen: "/tracking", params: { orderId: order._id.toString() } } },
    })
    .catch((err: any) => console.error(`${BADGE} no-rider notice failed:`, err.message));
}

/* ── The rider answering ──────────────────────────────────────────────────── */

/**
 * A rider takes the order. One atomic update: the order must still be searching,
 * still have no driver, and still carry an open offer for this rider. Throws a
 * ConflictError the driver app can show when someone else got there first.
 */
export async function claimOffer(orderId: string, driverUserId: string, driverDocId: mongoose.Types.ObjectId) {
  const busy = await busyDriverIds([driverDocId]);
  if (busy.size) throw new ConflictError("Finish your current order before taking another one.");

  const now = new Date();
  const claimed: any = await Order.findOneAndUpdate(
    {
      _id: orderId,
      dispatchMode: "broadcast",
      "dispatch.state": "searching",
      status: OrderStatus.SEARCHING_DRIVER,
      driver: null,
      "dispatch.offers": { $elemMatch: { driverUserId, outcome: "offered" } },
    },
    {
      $set: {
        driver: driverDocId,
        status: OrderStatus.DRIVER_ASSIGNED,
        "dispatch.state": "assigned",
        "dispatch.failureReason": "",
        "dispatch.offers.$.outcome": "accepted",
        "dispatch.offers.$.respondedAt": now,
      },
    },
    { new: true },
  );

  if (!claimed) {
    const current: any = await Order.findById(orderId).select("status driver").lean();
    if (!current) throw new ConflictError("This order no longer exists.");
    if (current.driver) throw new ConflictError("Another driver already accepted this order.");
    if (current.status === OrderStatus.CANCELLED) throw new ConflictError("This order was cancelled.");
    throw new ConflictError("This offer is no longer available.");
  }

  clearSession(orderId);
  await closeOpenOffers(claimed, "superseded", driverUserId);
  await closeOffersForDriver(driverUserId, orderId);
  console.log(`${BADGE} ${orderId} ACCEPTED by driver user ${driverUserId}`);
  return claimed;
}

/** A rider says no. Just recorded: nobody is waiting on them, and they won't be asked again. */
export async function declineOffer(orderId: string, driverUserId: string, reason = "") {
  await Order.updateOne(
    { _id: orderId, "dispatch.offers": { $elemMatch: { driverUserId, outcome: "offered" } } },
    {
      $set: {
        "dispatch.offers.$.outcome": "declined",
        "dispatch.offers.$.respondedAt": new Date(),
        "dispatch.offers.$.reason": String(reason || "").slice(0, 200),
      },
    },
  );
  SocketManager.getInstance()?.emitToDriver(driverUserId, "order_offer_expired", { orderId, reason: "declined" }, "FoodDispatch.decline");
  console.log(`${BADGE} ${orderId} declined by driver user ${driverUserId}${reason ? ` — ${reason}` : ""}`);
}

/** A rider who just took a job is no longer holding any other food offer. */
export async function closeOffersForDriver(driverUserId: string, exceptOrderId?: string) {
  const open = await Order.find({
    ...(exceptOrderId ? { _id: { $ne: exceptOrderId } } : {}),
    "dispatch.state": "searching",
    "dispatch.offers": { $elemMatch: { driverUserId, outcome: "offered" } },
  }).select("_id").lean();
  for (const row of open) {
    await Order.updateOne(
      { _id: row._id, "dispatch.offers": { $elemMatch: { driverUserId, outcome: "offered" } } },
      { $set: { "dispatch.offers.$.outcome": "superseded", "dispatch.offers.$.respondedAt": new Date() } },
    );
    SocketManager.getInstance()?.emitToDriver(driverUserId, "order_offer_expired", { orderId: String(row._id), reason: "busy" }, "FoodDispatch.busy");
  }
}

/* ── The restaurant's time to accept ──────────────────────────────────────── */

/** Cancels an order the restaurant didn't accept in time; supplied by OrdersService. */
export type RestaurantTimeoutHandler = (orderId: string) => Promise<unknown>;

const acceptTimers = new Map<string, NodeJS.Timeout>();
let restaurantTimeoutHandler: RestaurantTimeoutHandler | null = null;

/**
 * Arms the "cancel unless accepted by `acceptBy`" timer for a new food order. The
 * handler re-checks the order atomically, so an accept that lands at the last
 * moment wins and the timer does nothing. A deadline already past fires at once.
 */
export function scheduleRestaurantTimeout(orderId: string, acceptBy: Date, handler: RestaurantTimeoutHandler) {
  clearRestaurantTimeout(orderId);
  const delay = Math.max(0, new Date(acceptBy).getTime() - Date.now());
  acceptTimers.set(
    orderId,
    setTimeout(() => {
      acceptTimers.delete(orderId);
      handler(orderId).catch((err: any) => console.error(`${BADGE} ${orderId} accept-timeout cancel failed:`, err.message));
    }, delay),
  );
}

export function clearRestaurantTimeout(orderId: string) {
  const timer = acceptTimers.get(orderId);
  if (timer) clearTimeout(timer);
  acceptTimers.delete(orderId);
}

/** The order was cancelled (customer, restaurant or admin): close every open offer. */
export async function cancelDispatch(orderId: string) {
  clearRestaurantTimeout(orderId);
  clearSession(orderId);
  const order: any = await Order.findById(orderId);
  if (!order || order.dispatchMode !== "broadcast") return;
  await closeOpenOffers(order, "cancelled");
  await Order.updateOne(
    { _id: order._id, "dispatch.state": { $in: ["searching", "unassigned"] } },
    { $set: { "dispatch.state": "idle" } },
  );
}

/** The open offer this rider holds, for the driver app's poll when its socket missed it. */
export async function currentOfferFor(driverUserId: string) {
  const order: any = await Order.findOne({
    dispatchMode: "broadcast",
    "dispatch.state": "searching",
    status: OrderStatus.SEARCHING_DRIVER,
    driver: null,
    "dispatch.offers": { $elemMatch: { driverUserId, outcome: "offered" } },
  }).sort({ createdAt: -1 });
  if (!order) return null;

  const offer = (order.dispatch.offers || []).find((o: IFoodOffer) => o.driverUserId === driverUserId && o.outcome === "offered");
  return withDistance(await offerPayload(order), offer?.distanceMeters || 0);
}

/* ── Backstop ─────────────────────────────────────────────────────────────── */

let sweeping = false;

/**
 * The backstop, every `sweepIntervalMs`:
 *  - an order still waiting for the restaurant gets its accept timer back (after a
 *    restart), which cancels it at once if its time is already up;
 *  - an order that found nobody is searched again on a growing backoff;
 *  - an order whose food is due and whose offers have all gone unanswered is
 *    searched again too (offers have no countdown, so nothing else would);
 *  - either one past `maxSweeps` gets the one-time customer notice;
 *  - a search this process has no widen timers for (a restart) gets them back.
 */
export async function sweepStalledDispatch() {
  if (sweeping || mongoose.connection.readyState !== 1) return;
  sweeping = true;
  try {
    if (restaurantTimeoutHandler) {
      const waitingForRestaurant: any[] = await Order.find({
        dispatchMode: "broadcast",
        status: OrderStatus.CREATED,
        restaurantAcceptBy: { $type: "date" },
      })
        .select("_id restaurantAcceptBy")
        .limit(200)
        .lean();
      for (const row of waitingForRestaurant) {
        if (!acceptTimers.has(String(row._id))) {
          scheduleRestaurantTimeout(String(row._id), row.restaurantAcceptBy, restaurantTimeoutHandler);
        }
      }
    }

    const live: any[] = await Order.find({
      dispatchMode: "broadcast",
      "dispatch.state": { $in: ["searching", "unassigned"] },
      status: OrderStatus.SEARCHING_DRIVER,
      driver: null,
    })
      .select("_id user prepMinutes restaurantAcceptedAt dispatch.state dispatch.attempts dispatch.lastAttemptAt dispatch.failureReason")
      .limit(100)
      .lean();

    for (const row of live) {
      const orderId = String(row._id);
      const attempts = row.dispatch?.attempts || 0;
      const last = row.dispatch?.lastAttemptAt ? new Date(row.dispatch.lastAttemptAt).getTime() : 0;
      const backoffDue = Date.now() - last >= cfg.unassignedRetryMs * Math.max(1, attempts);
      const readyAt = readyAtFor(row);
      const foodDue = !readyAt || readyAt.getTime() <= Date.now();
      // A search still inside its prep window is the widen timers' job, not ours.
      const due = backoffDue && (row.dispatch?.state === "unassigned" || foodDue);

      if (due && attempts < cfg.maxSweeps) {
        await startDispatch(orderId, "retry");
      } else if (due) {
        await giveUp(row);
      } else if (row.dispatch?.state === "searching" && !sessions.has(orderId)) {
        console.warn(`${BADGE} ${orderId} had no widen schedule in this process — rebooking`);
        scheduleWidening(row);
      }
    }
  } catch (err: any) {
    console.error(`${BADGE} backstop sweep failed:`, err.message);
  } finally {
    sweeping = false;
  }
}

let sweepTimer: NodeJS.Timeout | null = null;

export function startFoodDispatchSweeper(opts: { onRestaurantTimeout: RestaurantTimeoutHandler }) {
  restaurantTimeoutHandler = opts.onRestaurantTimeout;
  if (sweepTimer) return;
  sweepTimer = setInterval(() => void sweepStalledDispatch(), cfg.sweepIntervalMs);
  console.log("🛵 Food dispatch backstop started.");
}
