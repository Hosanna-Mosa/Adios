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
  },
  { timestamps: true }
);

OrderSchema.index({ "stops.location": "2dsphere" });

export default mongoose.model<IOrder>("Order", OrderSchema);
