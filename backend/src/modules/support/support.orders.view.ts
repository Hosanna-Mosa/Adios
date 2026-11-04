/**
 * What a support agent may see of an order. Built field by field (a whitelist), so a
 * field added to Order later stays hidden from support until someone adds it here.
 *
 * Left out on purpose:
 *  - deliveryOtp, restaurantPickupCode and the helper start OTP / completion PIN: an
 *    agent who can read them can be talked into reading them out to someone posing as
 *    the customer, and they are the only thing proving a handover.
 *  - Razorpay ids, payout and KYC data of the driver/outlet, live driver location.
 * Every phone number is masked (maskPhone) — support is view-only and calls nobody.
 */

const RIDE_TYPES = ["bike", "auto", "cab", "cab_prime"];

export type SupportOrderKind = "packageDelivery" | "ride" | "food" | "courier" | "helper";

/** Same split as the admin panel's orderServiceKind (admin/src/components/shared/orderService.ts). */
export function supportOrderKind(order: { serviceType?: unknown; packageDelivery?: unknown; vendor?: unknown }): SupportOrderKind {
  const type = String(order.serviceType || "").toLowerCase();
  if (order.packageDelivery) return "packageDelivery";
  if (RIDE_TYPES.includes(type)) return "ride";
  if (type === "helper") return "helper";
  return order.vendor ? "food" : "courier";
}

/**
 * "98xxxxx210": the first two and last three digits of the national number. Enough
 * for an agent to confirm "is your number ending 210?", not enough to call it.
 * Numbers too short to mask meaningfully are hidden entirely.
 */
export function maskPhone(phone: unknown): string | null {
  if (phone == null || phone === "") return null;
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length < 7) return "xxxxx";
  // +91 / 0 prefixes: keep the last 10 digits, the national number.
  const national = digits.length > 10 ? digits.slice(-10) : digits;
  return `${national.slice(0, 2)}${"x".repeat(national.length - 5)}${national.slice(-3)}`;
}

const idOf = (value: any): string | null => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value._id) return String(value._id);
  return String(value);
};

const dateOrNull = (value: any) => (value ? new Date(value).toISOString() : null);

const contact = (c: any) => (c ? { name: c.name || null, phone: maskPhone(c.phone) } : null);

export interface SupportOutlet {
  _id: string;
  name?: string;
  phone?: string;
  address?: string;
  partnerType: "food" | "meat";
}

/** One row of the support order search. */
export function toSupportOrderRow(order: any, outlet?: SupportOutlet | null) {
  const customer = order.user && typeof order.user === "object" ? order.user : null;
  const driverUser = order.driver?.user && typeof order.driver.user === "object" ? order.driver.user : null;
  const stops = Array.isArray(order.stops) ? order.stops : [];
  return {
    _id: String(order._id),
    status: order.status,
    kind: supportOrderKind(order),
    serviceType: order.serviceType,
    createdAt: dateOrNull(order.createdAt),
    customer: customer ? { _id: idOf(customer), name: customer.name || null, phone: maskPhone(customer.phone) } : null,
    driverName: driverUser?.name || null,
    outletName: outlet?.name || null,
    from: stops[0]?.address || null,
    to: stops.length > 1 ? stops[stops.length - 1]?.address || null : null,
    total: Number(order.totalPrice) || 0,
    paymentMethod: order.paymentMethod || null,
    paymentStatus: order.paymentStatus || null,
    refundStatus: order.refundStatus || null,
  };
}

/** The full order page for support. `items` comes from OrdersService.extractOrderItems. */
export function toSupportOrderView(order: any, extras: { outlet?: SupportOutlet | null; items?: any[] } = {}) {
  const customer = order.user && typeof order.user === "object" ? order.user : null;
  const driver = order.driver && typeof order.driver === "object" ? order.driver : null;
  const driverUser = driver?.user && typeof driver.user === "object" ? driver.user : null;
  const outlet = extras.outlet || null;
  const accepted = order.dispatch?.offers?.find((o: any) => o?.outcome === "accepted");

  return {
    _id: String(order._id),
    status: order.status,
    kind: supportOrderKind(order),
    serviceType: order.serviceType,
    createdAt: dateOrNull(order.createdAt),
    updatedAt: dateOrNull(order.updatedAt),

    customer: customer
      ? { _id: idOf(customer), name: customer.name || null, phone: maskPhone(customer.phone) }
      : { _id: idOf(order.user), name: null, phone: null },
    bookingFor: order.bookingFor
      ? { type: order.bookingFor.type, contactNumber: maskPhone(order.bookingFor.contactNumber) }
      : null,
    driver: driver
      ? {
          _id: idOf(driver),
          name: driverUser?.name || null,
          phone: maskPhone(driverUser?.phone),
          vehicleType: driver.vehicleType || null,
        }
      : null,
    outlet: outlet
      ? { _id: outlet._id, name: outlet.name || null, phone: maskPhone(outlet.phone), address: outlet.address || null, partnerType: outlet.partnerType }
      : null,

    stops: (Array.isArray(order.stops) ? order.stops : []).map((stop: any) => ({
      sequence: stop.sequence,
      type: stop.type,
      address: stop.address || null,
      instructions: typeof stop.items?.instructions === "string" ? stop.items.instructions : null,
      location: Array.isArray(stop.location?.coordinates) ? { coordinates: stop.location.coordinates } : null,
    })),
    items: (extras.items || []).map((line: any) => ({
      name: line.name,
      quantity: line.quantity,
      price: line.price,
    })),
    packageDelivery: order.packageDelivery
      ? {
          payAt: order.packageDelivery.payAt,
          pickupContact: contact(order.packageDelivery.pickupContact),
          dropContact: contact(order.packageDelivery.dropContact),
        }
      : null,

    pricing: {
      total: Number(order.totalPrice) || 0,
      customerPrice: order.customerPrice ?? null,
      breakdown: order.priceBreakdown || null,
      couponCode: order.couponCode || null,
      discountAmount: order.discountAmount || 0,
      distanceKm: order.totalDistance ?? null,
      durationMinutes: order.duration ?? null,
    },
    payment: {
      method: order.paymentMethod || null,
      status: order.paymentStatus || null,
      cashCollected: !!order.cashCollected,
      cashCollectedAt: dateOrNull(order.cashCollectedAt),
      cashCollectedAmount: order.cashCollectedAmount ?? null,
    },
    refund: order.refundStatus && order.refundStatus !== "not_requested"
      ? {
          status: order.refundStatus,
          amount: order.refundAmount ?? null,
          method: order.refundMethod || null,
          reference: order.refundReference || null,
          requestedAt: dateOrNull(order.refundRequestedAt),
          completedAt: dateOrNull(order.refundCompletedAt),
          failureReason: order.refundFailureReason || null,
        }
      : null,

    schedule: order.scheduledFor
      ? { scheduledFor: dateOrNull(order.scheduledFor), status: order.scheduleStatus || null, rejectionReason: order.scheduleRejectionReason || null }
      : null,
    cancelReason: order.cancelReason || null,
    // Timestamps the order records — the agent's timeline. Absent ones stay null.
    timeline: {
      createdAt: dateOrNull(order.createdAt),
      restaurantAcceptBy: dateOrNull(order.restaurantAcceptBy),
      restaurantAcceptedAt: dateOrNull(order.restaurantAcceptedAt),
      prepMinutes: order.prepMinutes ?? null,
      foodReadyAt: dateOrNull(order.foodReadyAt),
      driverAcceptedAt: dateOrNull(accepted?.respondedAt),
      assignConfirmedAt: dateOrNull(order.assignConfirmedAt),
      taskStartedAt: dateOrNull(order.taskStartedAt),
      taskCompletedAt: dateOrNull(order.taskCompletedAt),
      searchExhaustedAt: dateOrNull(order.searchExhaustedAt),
      updatedAt: dateOrNull(order.updatedAt),
    },
    dispatch: order.dispatch
      ? {
          state: order.dispatch.state,
          attempts: order.dispatch.attempts ?? 0,
          candidateCount: order.dispatch.candidateCount ?? 0,
          failureReason: order.dispatch.failureReason || null,
        }
      : null,
    isReviewed: !!order.isReviewed,
  };
}

// ---- Search filters (pure, so they are testable without a database) ----

export const SUPPORT_STATUS_GROUPS = ["active", "completed", "cancelled"] as const;
export type SupportStatusGroup = (typeof SUPPORT_STATUS_GROUPS)[number];

const FINISHED_STATUSES = ["DELIVERED", "COMPLETED", "delivered", "completed"];
const CANCELLED_STATUSES = ["CANCELLED", "cancelled"];

export function statusGroupFilter(group: SupportStatusGroup): Record<string, unknown> {
  if (group === "completed") return { status: { $in: FINISHED_STATUSES } };
  if (group === "cancelled") return { status: { $in: CANCELLED_STATUSES } };
  return { status: { $nin: [...FINISHED_STATUSES, ...CANCELLED_STATUSES] } };
}

/** The Mongo filter for one supportOrderKind (same rules, run in the query). */
export function kindFilter(kind: SupportOrderKind): Record<string, unknown> {
  const notRideOrHelper = { serviceType: { $nin: [...RIDE_TYPES, "helper"] } };
  switch (kind) {
    case "packageDelivery":
      return { packageDelivery: { $ne: null } };
    case "ride":
      return { serviceType: { $in: RIDE_TYPES }, packageDelivery: null };
    case "helper":
      return { serviceType: "helper", packageDelivery: null };
    case "food":
      return { ...notRideOrHelper, vendor: { $ne: null }, packageDelivery: null };
    case "courier":
      return { ...notRideOrHelper, vendor: null, packageDelivery: null };
  }
}

export const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * How the free-text box is read. Agents type whatever the customer reads out: an
 * order id ("ADSF161026123456", "#123456"), a phone number, or a name.
 *  - orderIdPattern: alphanumeric terms of 4+ characters with a digit, matched anywhere in the id.
 *  - phoneDigits: terms made only of phone characters with 4+ digits (last 10 kept).
 *  - namePattern: terms containing a letter, 2+ characters.
 */
export function parseSearchTerm(raw: unknown): { orderIdPattern: string | null; phoneDigits: string | null; namePattern: string | null } {
  const term = String(raw ?? "").trim().replace(/^#/, "");
  if (!term) return { orderIdPattern: null, phoneDigits: null, namePattern: null };

  const compact = term.replace(/\s+/g, "");
  const orderIdPattern = /^[A-Za-z0-9-]{4,}$/.test(compact) && /\d/.test(compact) ? escapeRegex(compact.toUpperCase()) : null;

  const digits = term.replace(/\D/g, "");
  const phoneDigits = /^[+\d\s()-]+$/.test(term) && digits.length >= 4 ? digits.slice(-10) : null;

  // A letter in any script, so Telugu / Hindi names match as well as Latin ones.
  const namePattern = /\p{L}/u.test(term) && term.length >= 2 ? escapeRegex(term) : null;

  return { orderIdPattern, phoneDigits, namePattern };
}
