import { sub, type AnswerPart } from "./answers";

// Resolvers are pure: they get a plain snapshot of the customer's data (built by the processor)
// and return answer fragments. No DB access here, which keeps them unit-testable. They must
// never put the helper start OTP / completion PIN (restaurantPickupCode / deliveryOtp) in an
// answer — the snapshot does not even carry them.

export interface OrderSnapshot {
  id: string;
  status: string;
  serviceType: string;
  paymentMethod?: string;
  paymentStatus?: string;
  cancelReason?: string | null;
  prepMinutes?: number | null;
  restaurantAcceptedAt?: Date | null;
  scheduledFor?: Date | null;
  scheduleStatus?: string | null;
  scheduleRejectionReason?: string | null;
  refundStatus?: string;
  refundAmount?: number;
  refundRequestedAt?: Date;
  refundCompletedAt?: Date;
  searchExhaustedAt?: Date | null;
  dispatch?: { attempts?: number; startedAt?: Date; failureReason?: string; state?: string } | null;
  priceBreakdown?: { baseFare?: number; distanceFare?: number; timeFare?: number; surgeMultiplier?: number; total?: number };
  totalPrice?: number;
  discountAmount?: number;
  assignConfirmedAt?: Date | null;
  taskStartedAt?: Date | null;
  driverName?: string;
  createdAt?: Date;
}

export interface PaymentSnapshot {
  status: string;
  purpose: string;
  amountPaise: number;
  hasOrder: boolean;
  topupAmount?: number;
  topupRefundStatus?: string;
  order?: string;
  createdAt?: Date;
}

export interface ResolverContext {
  order: OrderSnapshot | null;
  payments: PaymentSnapshot[];
  staticAnswer?: string;
  category: string;
  now: Date;
}

export type Stage =
  | "created" | "searching" | "assigned" | "arrived" | "picking" | "onTheWay" | "inProgress" | "delivered" | "cancelled" | "unknown";

/** Order statuses exist in upper and lower case (Order.ts); this maps both onto one stage. */
export function normalizeStatus(status: unknown): Stage {
  switch (String(status || "").toLowerCase()) {
    case "created":
    case "confirmed":
      return "created";
    case "searching_driver":
      return "searching";
    case "driver_assigned":
    case "en_route_pickup":
      return "assigned";
    case "arrived_pickup":
      return "arrived";
    case "picking_items":
      return "picking";
    case "on_the_way":
    case "in_transit":
    case "en_route_delivery":
    case "arrived_delivery":
      return "onTheWay";
    case "in_progress":
      return "inProgress";
    case "completed":
    case "delivered":
      return "delivered";
    case "cancelled":
      return "cancelled";
    default:
      return "unknown";
  }
}

const money = (n: number | undefined) => {
  const v = Number(n || 0);
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
};

const fmtDate = (d: Date | undefined | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }) : "";
const fmtWhen = (d: Date | undefined | null) =>
  d
    ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" })
    : "";

const isFood = (o: OrderSnapshot) => o.prepMinutes !== undefined || o.restaurantAcceptedAt !== undefined;
const driverOf = (o: OrderSnapshot) => o.driverName || "Your driver";

function noOrder(ctx: ResolverContext): AnswerPart[] {
  return [{ key: "noOrder", params: { category: ctx.category === "general" || ctx.category === "payment" ? "" : ctx.category } }];
}

function refundParts(o: OrderSnapshot): AnswerPart[] {
  if (o.paymentMethod !== "online") return [{ key: "refundCash" }];
  const amount = money(o.refundAmount ?? o.priceBreakdown?.total ?? o.totalPrice);
  switch (o.refundStatus) {
    case "pending":
      return [{ key: "refundPending", params: { amount, since: o.refundRequestedAt ? sub("since", { date: fmtDate(o.refundRequestedAt) }) : "" } }];
    case "processed":
      return [{ key: "refundProcessed", params: { amount, since: o.refundCompletedAt ? sub("since", { date: fmtDate(o.refundCompletedAt) }) : "" } }];
    case "failed":
      return [{ key: "refundFailed", params: { amount } }];
    default:
      return [{ key: "refundNone" }];
  }
}

export const RESOLVER_DESCRIPTIONS: Record<string, string> = {
  orderStatus: "Current status of the customer's order, with driver and restaurant details",
  whyCancelled: "Why the order was cancelled, plus the refund state",
  driverAssignment: "Driver search progress for the order",
  refundStatus: "Refund state of the order and any price top-ups",
  paymentIssue: "Failed, stuck or flagged payments on the customer's account (no order needed)",
  fareBreakdown: "How the fare was calculated",
  scheduledDelivery: "Schedule status for scheduled orders",
  helperTask: "Status of a helper task (never reveals codes)",
  helperPricing: "How a helper task's price is calculated (static text)",
  static: "Fixed answer typed in the admin panel",
};

type Resolver = (ctx: ResolverContext) => AnswerPart[];

const orderStatus: Resolver = ({ order: o }) => {
  if (!o) return [{ key: "orderMissing" }];
  const ref = o.id;
  const driver = driverOf(o);
  switch (normalizeStatus(o.status)) {
    case "created":
      return [{ key: "stAwaitRestaurant", params: { ref } }];
    case "searching":
      return [{ key: "stSearching", params: { ref } }];
    case "assigned":
      if (isFood(o) && o.restaurantAcceptedAt && !o.driverName)
        return [{ key: "stPreparing", params: { ref, prep: o.prepMinutes ? sub("prepSuffix", { minutes: o.prepMinutes }) : "" } }];
      return [{ key: "stAssigned", params: { ref, driver } }];
    case "arrived":
      return [{ key: "stArrived", params: { ref, driver } }];
    case "picking":
      return [{ key: "stPicking", params: { ref, driver } }];
    case "onTheWay":
      return [{ key: "stOnTheWay", params: { ref, driver } }];
    case "inProgress":
      return [{ key: "stInProgress", params: { ref, driver } }];
    case "delivered":
      return [{ key: "stDelivered", params: { ref } }];
    case "cancelled":
      return [{ key: "stCancelled", params: { ref } }];
    default:
      return [{ key: "stUnknown", params: { ref, status: o.status } }];
  }
};

const CANCEL_KEYS: Record<string, string> = {
  restaurant_rejected: "cancelRestaurantRejected",
  restaurant_timeout: "cancelRestaurantTimeout",
  driver_cancelled: "cancelDriver",
  admin_cancelled: "cancelAdmin",
  customer_cancelled: "cancelCustomer",
  no_helpers: "cancelNoHelpers",
};

export function cancelReasonKey(o: Pick<OrderSnapshot, "cancelReason" | "serviceType" | "dispatch" | "searchExhaustedAt">): string {
  if (o.cancelReason && CANCEL_KEYS[o.cancelReason]) return CANCEL_KEYS[o.cancelReason];
  if (o.serviceType === "helper" && o.searchExhaustedAt) return "cancelNoHelpers";
  if (o.dispatch?.failureReason) return "cancelNoDriver";
  return "cancelUnknown";
}

const whyCancelled: Resolver = ({ order: o }) => {
  if (!o) return [{ key: "orderMissing" }];
  if (normalizeStatus(o.status) !== "cancelled") return [{ key: "notCancelled", params: { ref: o.id } }];
  return [{ key: cancelReasonKey(o), params: { ref: o.id } }, ...(o.paymentMethod === "online" ? refundParts(o) : [])];
};

const driverAssignment: Resolver = ({ order: o, now }) => {
  if (!o) return [{ key: "orderMissing" }];
  const stage = normalizeStatus(o.status);
  if (stage === "created" || stage === "searching") {
    if (o.searchExhaustedAt || o.dispatch?.state === "exhausted" || o.dispatch?.failureReason)
      return [{ key: "daExhausted", params: { ref: o.id } }];
    const started = o.dispatch?.startedAt || o.createdAt;
    const minutes = started ? Math.max(0, Math.round((now.getTime() - new Date(started).getTime()) / 60000)) : 0;
    const attempts = o.dispatch?.attempts ? sub("daAttempts", { count: o.dispatch.attempts }) : "";
    return [{ key: "daSearching", params: { ref: o.id, minutes, attempts } }];
  }
  if (stage === "cancelled" || stage === "delivered") return [{ key: "daNotNeeded", params: { ref: o.id, status: o.status } }];
  return [{ key: "daAssigned", params: { ref: o.id, driver: driverOf(o) } }];
};

const refundStatus: Resolver = ({ order: o, payments }) => {
  if (!o) return [{ key: "orderMissing" }];
  const parts = normalizeStatus(o.status) === "cancelled" || o.refundStatus && o.refundStatus !== "not_requested" ? refundParts(o) : [];
  const topups = payments.filter((p) => p.purpose === "topup" && p.order === o.id && p.status === "captured");
  const stage = normalizeStatus(o.status);
  for (const t of topups) {
    const state =
      stage !== "cancelled"
        ? "stateNotRefunded"
        : t.topupRefundStatus === "processed"
          ? "stateProcessed"
          : t.topupRefundStatus === "failed"
            ? "stateFailed"
            : "statePending";
    parts.push({ key: "topupRefundLine", params: { amount: money(t.topupAmount ?? t.amountPaise / 100), ref: o.id, state: sub(state) } });
  }
  return parts.length ? parts : refundParts(o);
};

const paymentIssue: Resolver = ({ payments, now }) => {
  const flagged = payments.find((p) => p.status === "flagged");
  if (flagged) return [{ key: "payFlagged", params: { amount: money(flagged.amountPaise / 100) } }];
  // Created/processing for over 15 minutes with no order = the customer left without paying.
  const stuck = payments.find(
    (p) => (p.status === "created" || p.status === "processing") && !p.hasOrder && p.createdAt && now.getTime() - new Date(p.createdAt).getTime() > 15 * 60000
  );
  if (stuck) return [{ key: "payStuck", params: { amount: money(stuck.amountPaise / 100) } }];
  return [{ key: "payOk" }];
};

const fareBreakdown: Resolver = ({ order: o }) => {
  if (!o) return [{ key: "orderMissing" }];
  const b = o.priceBreakdown || {};
  const parts: AnswerPart[] = [
    { key: "fare", params: { ref: o.id, base: money(b.baseFare), distance: money(b.distanceFare), time: money(b.timeFare) } },
  ];
  if (b.surgeMultiplier && b.surgeMultiplier > 1) parts.push({ key: "fareSurge", params: { surge: b.surgeMultiplier } });
  if (o.discountAmount) parts.push({ key: "fareDiscount", params: { discount: money(o.discountAmount) } });
  parts.push({ key: "fareTotal", params: { total: money(o.totalPrice ?? b.total) } });
  return parts;
};

const scheduledDelivery: Resolver = ({ order: o }) => {
  if (!o) return [{ key: "orderMissing" }];
  if (!o.scheduledFor) return [{ key: "schedNone", params: { ref: o.id } }];
  const when = fmtWhen(o.scheduledFor);
  if (o.scheduleStatus === "accepted") return [{ key: "schedAccepted", params: { ref: o.id, when } }];
  if (o.scheduleStatus === "rejected")
    return [
      {
        key: "schedRejected",
        params: { ref: o.id, when, reason: o.scheduleRejectionReason ? sub("schedReason", { reason: o.scheduleRejectionReason }) : "" },
      },
    ];
  return [{ key: "schedPending", params: { ref: o.id, when } }];
};

const helperTask: Resolver = ({ order: o }) => {
  if (!o) return [{ key: "orderMissing" }];
  const stage = normalizeStatus(o.status);
  const ref = o.id;
  if (stage === "cancelled") return whyCancelled({ order: o } as ResolverContext);
  if (stage === "delivered") return [{ key: "stDelivered", params: { ref } }];
  if (stage === "inProgress" || o.taskStartedAt) return [{ key: "helperStarted", params: { ref, driver: driverOf(o) } }];
  if (stage === "assigned") return [{ key: "helperAssigned", params: { ref, driver: driverOf(o) } }];
  return [{ key: "helperSearching", params: { ref } }];
};

const helperPricing: Resolver = () => [{ key: "helperPriceHelp" }];

const staticResolver: Resolver = ({ staticAnswer }) =>
  staticAnswer ? [{ key: "__static", params: { text: staticAnswer } }] : [{ key: "emptyStatic" }];

export const RESOLVERS: Record<string, Resolver> = {
  orderStatus,
  whyCancelled,
  driverAssignment,
  refundStatus,
  paymentIssue,
  fareBreakdown,
  scheduledDelivery,
  helperTask,
  helperPricing,
  static: staticResolver,
};

export const RESOLVER_KEYS = Object.keys(RESOLVERS);

export function runResolver(key: string, ctx: ResolverContext): AnswerPart[] {
  const resolver = RESOLVERS[key];
  if (!resolver) return [{ key: "emptyStatic" }];
  // Order-based answers with nothing to look at.
  if (!ctx.order && !["paymentIssue", "helperPricing", "static"].includes(key)) return noOrder(ctx);
  return resolver(ctx);
}
