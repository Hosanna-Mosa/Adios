export interface ExpansionStage {
  stage: number;
  name: string;
  radiusMeters: number;
}

export interface VehicleDispatchConfig {
  stages: ExpansionStage[];
}

export const DISPATCH_CONFIG: Record<string, VehicleDispatchConfig> = {
  bike: {
    stages: [
      { stage: 1, name: "Stage 1 (Inner Ring - 3 km)", radiusMeters: 3000 },
      { stage: 2, name: "Stage 2 (Middle Ring - 6 km)", radiusMeters: 6000 },
      { stage: 3, name: "Stage 3 (City Outer - 10 km)", radiusMeters: 10000 },
    ],
  },
  auto: {
    stages: [
      { stage: 1, name: "Stage 1 (Inner Ring - 3 km)", radiusMeters: 3000 },
      { stage: 2, name: "Stage 2 (Middle Ring - 6 km)", radiusMeters: 6000 },
      { stage: 3, name: "Stage 3 (City Outer - 10 km)", radiusMeters: 10000 },
    ],
  },
  cab: {
    stages: [
      { stage: 1, name: "Stage 1 (Inner Ring - 5 km)", radiusMeters: 5000 },
      { stage: 2, name: "Stage 2 (Middle Ring - 8 km)", radiusMeters: 8000 },
      { stage: 3, name: "Stage 3 (City Outer - 15 km)", radiusMeters: 15000 },
    ],
  },
  cab_prime: {
    stages: [
      { stage: 1, name: "Stage 1 (Inner Ring - 5 km)", radiusMeters: 5000 },
      { stage: 2, name: "Stage 2 (Middle Ring - 8 km)", radiusMeters: 8000 },
      { stage: 3, name: "Stage 3 (City Outer - 15 km)", radiusMeters: 15000 },
    ],
  },
  delivery: {
    stages: [
      { stage: 1, name: "Stage 1 (Inner Ring - 4 km)", radiusMeters: 4000 },
      { stage: 2, name: "Stage 2 (Middle Ring - 8 km)", radiusMeters: 8000 },
      { stage: 3, name: "Stage 3 (City Outer - 12 km)", radiusMeters: 12000 },
    ],
  },
  helper: {
    stages: [
      { stage: 1, name: "Stage 1 (Inner Ring - 4 km)", radiusMeters: 4000 },
      { stage: 2, name: "Stage 2 (Middle Ring - 8 km)", radiusMeters: 8000 },
      { stage: 3, name: "Stage 3 (City Outer - 12 km)", radiusMeters: 12000 },
    ],
  },
  default: {
    stages: [
      { stage: 1, name: "Stage 1 (Inner Ring - 4 km)", radiusMeters: 4000 },
      { stage: 2, name: "Stage 2 (Middle Ring - 8 km)", radiusMeters: 8000 },
      { stage: 3, name: "Stage 3 (City Outer - 12 km)", radiusMeters: 12000 },
    ],
  },
};

/**
 * Food (restaurant) delivery dispatch — see services/foodDispatch.service.ts.
 *
 * Food orders do not use the stage rings above. The restaurant accepts and quotes a
 * prep time, and that quote becomes the search radius: every rider who could reach
 * the restaurant before the food is ready (at PLANNING_SPEED_KMH) is offered the
 * order at the same moment, and the first to accept gets it.
 */
export const FOOD_BROADCAST_CONFIG = {
  /** A scooter in ordinary city traffic. Turns prep minutes into a distance. */
  planningSpeedKmh: 20,
  /** Never search narrower than this, however short the quote. */
  minRadiusMeters: 2000,
  /** How much further each widen step reaches, in minutes of riding. */
  widenStepMinutes: 10,
  /** Full searches an order gets (accept, ready, retries) before a person is needed. */
  maxSweeps: 3,
  /** Safety valve on how many riders one round can wake up. */
  maxBroadcast: 40,
  /** The second widen check runs this long before the food is due. */
  finalCheckpointLeadMs: 5 * 60 * 1000,
  /** A widen check is never booked closer to now than this. */
  minCheckpointMs: 60 * 1000,
  /** Base wait before an order that found nobody is searched again; grows per attempt. */
  unassignedRetryMs: 2 * 60 * 1000,
  /** How often the backstop looks for searches this process lost track of. */
  sweepIntervalMs: 60 * 1000,
  /** Prep times a restaurant may quote. */
  prepMinutesMin: 5,
  prepMinutesMax: 120,
  /** A new food order the restaurant hasn't accepted by then is cancelled (and refunded). */
  restaurantAcceptTimeoutMs: 2 * 60 * 1000,
};

export function getDispatchStagesForVehicle(vehicleType?: string): ExpansionStage[] {
  if (!vehicleType) return DISPATCH_CONFIG.default.stages;
  const normalized = vehicleType.toLowerCase();
  return (DISPATCH_CONFIG[normalized] || DISPATCH_CONFIG.default).stages;
}

/**
 * Maps a ride/order service tier to the vehicleType value actually stored on a
 * Driver document, for building a `Driver.find({ vehicleType: ... })` filter.
 *
 * Driver.vehicleType's schema enum only ever contains "bike" | "auto" | "car" —
 * a driver registers one physical vehicle, not a price tier. "cab" and
 * "cab_prime" are two *service* tiers built on that same "car" registration
 * (comparable to UberX vs. Uber Black both being driven by a car), so they have
 * no vehicleType of their own to match. Every dispatch query that filtered
 * Driver.vehicleType directly against the raw tier ("cab", "cab_prime") could
 * therefore never match a single driver document — cab rides found zero
 * candidates at every search stage, unconditionally, regardless of proximity,
 * zone, or how many car drivers were online. Returns undefined for
 * helper/delivery orders and anything unrecognized, which have no vehicle
 * constraint and must not filter Driver.vehicleType at all.
 */
export function mapServiceTypeToDriverVehicleType(serviceType?: string): string | undefined {
  const normalized = serviceType?.toLowerCase();
  if (normalized === "cab" || normalized === "cab_prime") return "car";
  if (normalized === "bike" || normalized === "auto") return normalized;
  return undefined;
}

/**
 * Whether a driver who has toggled `activeServices` on ("ride" and/or "food"
 * from GoOnlineModal) would actually respond to an order of this serviceType.
 *
 * Mirrors, bucket-for-bucket, the exact filter driverStore.ts's "new_order"
 * socket handler already applies client-side before deciding whether to pop the
 * incoming-order modal at all: bike/auto/cab/cab_prime need "ride"; delivery
 * (food/meat) needs "food"; helper matches either, since it doesn't belong
 * exclusively to one category. Until this existed, the backend had no idea
 * `activeServices` was a thing — Driver.activeServices wasn't even a field —
 * so dispatch would offer a food order to a ride-only driver same as any other
 * candidate. Their app would then silently drop it (no modal, no decline call),
 * and the dispatcher had no way to tell: it just burned the full per-driver
 * offer timeout waiting on a driver who could never respond. Applying this same
 * rule in dispatch, not just in the app's UI, is what actually prevents that —
 * a driver who wouldn't act on this order category is never offered it, so the
 * cascade reaches someone who can.
 */
export function driverAcceptsServiceType(activeServices: string[] | undefined | null, serviceType?: string): boolean {
  // No serviceType at all means the caller isn't asking about a specific order
  // category — e.g. GET /drivers/nearby with no vehicleType, which is exactly
  // what the customer app's home screen uses to decide whether ANY driver is
  // around before it will show restaurants at all (see useHomeOnMainScroll's
  // nearbyDriversCount === 0 check). Neither isRideType nor isFoodType below
  // would ever match an empty category, so this used to return false for every
  // driver — hiding every restaurant regardless of how many drivers were really
  // online. Nothing to filter against means don't filter.
  if (!serviceType) return true;

  // Legacy drivers (field predates this app version, or never re-saved) get no
  // filter — same as before this existed — rather than being excluded from
  // every order because of an empty/missing list.
  const services = activeServices && activeServices.length > 0 ? activeServices : ["ride", "food"];
  const normalized = serviceType.toLowerCase();
  const isRideType = ["bike", "auto", "cab", "cab_prime", "helper"].includes(normalized);
  const isFoodType = ["delivery", "helper"].includes(normalized);
  return (isRideType && services.includes("ride")) || (isFoodType && services.includes("food"));
}
