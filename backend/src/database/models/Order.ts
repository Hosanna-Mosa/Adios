import mongoose, { Schema, Document } from "mongoose";

export enum ServiceType {
  BIKE = "bike",
  AUTO = "auto",
  CAB = "cab",
  CAB_PRIME = "cab_prime",
  DELIVERY = "delivery",
  HELPER = "helper",
}

export enum OrderStatus {
  CREATED = "CREATED",
  SEARCHING_DRIVER = "SEARCHING_DRIVER",
  DRIVER_ASSIGNED = "DRIVER_ASSIGNED",
  PICKING_ITEMS = "PICKING_ITEMS",
  ON_THE_WAY = "ON_THE_WAY",
  IN_PROGRESS = "IN_PROGRESS", // Helper specific status for ongoing tasks
  // Ride-specific statuses
  ARRIVED_PICKUP = "ARRIVED_PICKUP",
  IN_TRANSIT = "IN_TRANSIT",
  COMPLETED = "COMPLETED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",

  // Lowercase compatibility statuses for client tracking sequence
  CONFIRMED = "confirmed",
  DRIVER_ASSIGNED_LC = "driver_assigned",
  EN_ROUTE_PICKUP = "en_route_pickup",
  ARRIVED_PICKUP_LC = "arrived_pickup",
  PICKING_ITEMS_LC = "picking_items",
  IN_PROGRESS_LC = "in_progress", // Helper specific
  EN_ROUTE_DELIVERY = "en_route_delivery",
  ARRIVED_DELIVERY_LC = "arrived_delivery",
  DELIVERED_LC = "delivered",
}

export enum StopType {
  PICKUP = "pickup",
  DROP = "drop",
  STOP = "stop",
}

export interface IStop {
  sequence: number;
  location: {
    type: string;
    coordinates: number[];
  };
  address?: string;
  type: StopType;
  items?: any;
}

/** How a rider is found. "broadcast" = restaurant food orders (services/foodDispatch.service.ts). */
export type DispatchMode = "sequential" | "broadcast";

export type FoodDispatchState = "idle" | "searching" | "assigned" | "unassigned";

export type FoodOfferOutcome = "offered" | "accepted" | "declined" | "superseded" | "timeout" | "cancelled";

export interface IFoodOffer {
  driverUserId: string;
  driverId: string;
  distanceMeters: number;
  offeredAt: Date;
  outcome: FoodOfferOutcome;
  respondedAt?: Date;
  reason?: string;
}

/**
 * The sequential dispatcher's open offer (rides / helper / meat / package), persisted so a
 * driver app that polls instead of holding a socket can still see it. `payload` is the exact
 * object emitted as `new_order`.
 */
export interface ISequentialOffer {
  driverUserId: string;
  driverId?: string;
  offeredAt: Date;
  expiresAt: Date;
  payload: any;
}

/** The rider search for a broadcast (food) order. Runs alongside `status`, which stays the order's main track. */
export interface IFoodDispatch {
  state: FoodDispatchState;
  radiusMeters: number;
  attempts: number;
  startedAt?: Date;
  lastAttemptAt?: Date;
  candidateCount: number;
  failureReason?: string;
  offers: IFoodOffer[];
}

export interface IOrder extends Omit<Document, "_id"> {
  _id: string;
  user: mongoose.Types.ObjectId;
  vendor?: mongoose.Types.ObjectId;
  driver?: mongoose.Types.ObjectId;
  status: OrderStatus;
  serviceType: ServiceType;
  totalDistance: number;
  totalPrice: number;
  priceBreakdown: {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    surgeMultiplier: number;
    total: number;
  };
  stops: IStop[];
  radius?: number;
  duration?: number;
  customerPrice?: number;
  bookingFor?: {
    type: "myself" | "someone_else";
    contactNumber?: string;
  };
  scheduledDelivery?: {
    type: "now" | "later";
    requestedAt?: Date;
    restaurantAccepted?: boolean;
    acceptedAt?: Date;
    requestId?: string;
  };
  scheduledFor?: Date | null;
  scheduleStatus?: "pending" | "accepted" | "rejected" | null;
  scheduleRejectionReason?: string | null;
  couponCode?: string;
  discountAmount?: number;
  isReserved?: boolean;
  reservedAt?: Date;
  deliveryOtp?: string;
  restaurantPickupCode?: string;
  // How the customer pays. "cash": collected by the driver, the order stays "pending".
  // "online": paid through Razorpay before the order existed, so it is created "paid".
  paymentMethod?: "cash" | "online";
  // pending: nothing received yet (cash not collected). paid: captured online by Razorpay.
  // cash_collected: the assigned driver confirmed receiving the cash (POST /orders/:id/cash-collected).
  paymentStatus?: "pending" | "paid" | "cash_collected";
  payment?: mongoose.Types.ObjectId;
  cashCollected?: boolean;
  cashCollectedAt?: Date | null;
  cashCollectedAmount?: number | null;
  cashCollectedBy?: mongoose.Types.ObjectId | null;
  // Online refunds only. "processed"/"failed" are set from Razorpay's own answer (API or
  // webhook), never from a local update alone.
  refundStatus?: "not_requested" | "pending" | "processed" | "failed";
  razorpayRefundId?: string;
  refundAmount?: number; // rupees
  refundRequestedAt?: Date;
  refundCompletedAt?: Date;
  refundFailureReason?: string;
  // "razorpay": refunded through Razorpay. "manual": an admin sent the money themselves and
  // recorded the bank/UPI reference (only possible when no Razorpay refund exists).
  refundMethod?: "razorpay" | "manual";
  refundReference?: string;
  refundedBy?: mongoose.Types.ObjectId;
  refundNote?: string;
  polyline?: string;
  notified15Min?: boolean;
  isReviewed?: boolean;
  review?: mongoose.Types.ObjectId;
  declineReasons?: { driverId: string; reason: string }[];
  totalCandidatesCount?: number;
  // Food (restaurant) orders only. Unset on every other order, which keeps the sequential dispatcher.
  dispatchMode?: DispatchMode;
  /** Food orders: the restaurant must accept before this, or the order is cancelled. */
  restaurantAcceptBy?: Date | null;
  restaurantAcceptedAt?: Date | null;
  /**
   * Who cancelled it: "restaurant_rejected" | "restaurant_timeout" | "driver_cancelled" |
   * "admin_cancelled" | "customer_cancelled". Null on orders cancelled before this was recorded.
   */
  cancelReason?: string | null;
  prepMinutes?: number | null;
  foodReadyAt?: Date | null;
  dispatch?: IFoodDispatch;
  /** Sequential orders only: the offer currently held by one driver. Unset between offers. */
  currentOffer?: ISequentialOffer;
  /** Set when the sequential search ran out of drivers; cleared when a new search starts. */
  dispatchExhaustedAt?: Date;
  // Helper tasks: what used to be socket-only relays between customer and helper.
  helperTaskConfirmedAt?: Date;
  helperStatusText?: string;
  helperStatusAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StopSchema: Schema = new Schema({
  sequence: { type: Number, required: true },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  address: { type: String },
  type: {
    type: String,
    enum: Object.values(StopType),
    required: true,
  },
  items: { type: Schema.Types.Mixed },
});

const FoodOfferSchema: Schema = new Schema(
  {
    driverUserId: { type: String, required: true },
    driverId: { type: String, required: true },
    distanceMeters: { type: Number, default: 0 },
    offeredAt: { type: Date, required: true },
    outcome: {
      type: String,
      enum: ["offered", "accepted", "declined", "superseded", "timeout", "cancelled"],
      default: "offered",
    },
    respondedAt: { type: Date },
    reason: { type: String },
  },
  { _id: false }
);

const FoodDispatchSchema: Schema = new Schema(
  {
    state: { type: String, enum: ["idle", "searching", "assigned", "unassigned"], default: "idle" },
    radiusMeters: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    startedAt: { type: Date },
    lastAttemptAt: { type: Date },
    candidateCount: { type: Number, default: 0 },
    failureReason: { type: String },
    offers: { type: [FoodOfferSchema], default: [] },
  },
  { _id: false }
);

const OrderSchema: Schema = new Schema(
  {
    _id: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vendor: { type: Schema.Types.ObjectId, ref: "Vendor" },
    driver: { type: Schema.Types.ObjectId, ref: "Driver" },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.CREATED,
    },
    serviceType: {
      type: String,
      enum: Object.values(ServiceType),
      default: ServiceType.CAB,
    },
    totalDistance: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    priceBreakdown: {
      baseFare: { type: Number, default: 0 },
      distanceFare: { type: Number, default: 0 },
      timeFare: { type: Number, default: 0 },
      surgeMultiplier: { type: Number, default: 1 },
      total: { type: Number, default: 0 },
    },
    stops: [StopSchema],
    declineReasons: [
      {
        driverId: { type: String, required: true },
        reason: { type: String, required: true },
      },
    ],
    radius: { type: Number },
    duration: { type: Number },
    customerPrice: { type: Number },
    totalCandidatesCount: { type: Number, default: 0 },
    bookingFor: {
      type: {
        type: String,
        enum: ["myself", "someone_else"],
        default: "myself",
      },
      contactNumber: { type: String },
    },
    scheduledDelivery: {
      type: {
        type: String,
        enum: ["now", "later"],
      },
      requestedAt: { type: Date },
      restaurantAccepted: { type: Boolean, default: false },
      acceptedAt: { type: Date },
      requestId: { type: String },
    },
    scheduledFor: { type: Date, default: null },
    scheduleStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: null,
    },
    scheduleRejectionReason: { type: String, default: null },
    couponCode: { type: String },
    discountAmount: { type: Number, default: 0 },
    isReserved: { type: Boolean, default: false },
    reservedAt: { type: Date },
    deliveryOtp: { type: String },
    restaurantPickupCode: { type: String },
    paymentMethod: { type: String, enum: ["cash", "online"], default: "cash" },
    paymentStatus: { type: String, enum: ["pending", "paid", "cash_collected"], default: "pending" },
    payment: { type: Schema.Types.ObjectId, ref: "Payment", index: { sparse: true } },
    cashCollected: { type: Boolean, default: false },
    cashCollectedAt: { type: Date, default: null },
    cashCollectedAmount: { type: Number, default: null },
    cashCollectedBy: { type: Schema.Types.ObjectId, ref: "Driver", default: null },
    refundStatus: {
      type: String,
      enum: ["not_requested", "pending", "processed", "failed"],
      default: "not_requested",
    },
    razorpayRefundId: { type: String, index: { sparse: true } },
    refundAmount: { type: Number },
    refundRequestedAt: { type: Date },
    refundCompletedAt: { type: Date },
    refundFailureReason: { type: String },
    refundMethod: { type: String, enum: ["razorpay", "manual"] },
    refundReference: { type: String },
    refundedBy: { type: Schema.Types.ObjectId, ref: "User" },
    refundNote: { type: String },
    polyline: { type: String },
    notified15Min: { type: Boolean, default: false },
    isReviewed: { type: Boolean, default: false },
    review: { type: Schema.Types.ObjectId, ref: "Review" },
    dispatchMode: { type: String, enum: ["sequential", "broadcast"] },
    restaurantAcceptBy: { type: Date, default: null },
    restaurantAcceptedAt: { type: Date, default: null },
    cancelReason: { type: String, default: null },
    prepMinutes: { type: Number, default: null },
    foodReadyAt: { type: Date, default: null },
    // Left unset (not defaulted) on everything but broadcast orders.
    dispatch: { type: FoodDispatchSchema, default: undefined },
    currentOffer: {
      type: new Schema(
        {
          driverUserId: { type: String, required: true },
          driverId: { type: String },
          offeredAt: { type: Date, required: true },
          expiresAt: { type: Date, required: true },
          payload: { type: Schema.Types.Mixed },
        },
        { _id: false }
      ),
      default: undefined,
    },
    dispatchExhaustedAt: { type: Date },
    helperTaskConfirmedAt: { type: Date },
    helperStatusText: { type: String },
    helperStatusAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      // Who was offered a food order, and how far away they were, is the dispatcher's
      // business — not the customer's or the restaurant's. Every API response goes
      // through toJSON; the dispatcher works on documents and still sees the list.
      transform: (_doc: any, ret: any) => {
        if (ret.dispatch && Array.isArray(ret.dispatch.offers)) {
          ret.dispatch = { ...ret.dispatch, offerCount: ret.dispatch.offers.length };
          delete ret.dispatch.offers;
        }
        // Same for the sequential offer: only the offered driver reads it, through
        // GET /orders/driver/offer, which goes to the document directly.
        delete ret.currentOffer;
        return ret;
      },
    },
  }
);

OrderSchema.index({ "stops.location": "2dsphere" });
// An outlet's orders, newest first — the vendor panel and partner app list and page through these.
OrderSchema.index({ vendor: 1, createdAt: -1 });
// The food dispatcher's backstop sweep, and a rider's open-offer lookup.
OrderSchema.index({ "dispatch.state": 1 }, { sparse: true });
OrderSchema.index({ "dispatch.offers.driverUserId": 1, "dispatch.state": 1 }, { sparse: true });
// A driver's poll for the sequential offer it holds.
OrderSchema.index({ "currentOffer.driverUserId": 1 }, { sparse: true });
// Food orders still waiting for the restaurant — the accept-timeout backstop reads only these.
OrderSchema.index(
  { restaurantAcceptBy: 1 },
  { partialFilterExpression: { dispatchMode: "broadcast", status: "CREATED" } },
);

export default mongoose.model<IOrder>("Order", OrderSchema);
