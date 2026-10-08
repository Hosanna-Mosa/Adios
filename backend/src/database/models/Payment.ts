import mongoose, { Document, Schema } from "mongoose";

// One customer payment = one Razorpay order (RAZORPAY_INTEGRATION.md §6.7.2, reduced to what
// the pay-at-checkout flow needs today). The order the customer is buying is stored here at
// create time, so the server can place it once Razorpay confirms the money — whether the
// app, the checkout callback or the webhook gets there first.

export enum PaymentStatus {
  CREATED = "created",
  PROCESSING = "processing", // a run holds the lease and is placing the order
  CAPTURED = "captured", // money captured and the order placed
  FLAGGED = "flagged", // Razorpay reported an amount/currency/order that doesn't match
}

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId;
  // "order": pays for a new order (orderData). "topup": pays a helper task's raised price
  // (order + topupAmount), applied to that order once captured.
  purpose: "order" | "topup";
  amount: number; // paise
  currency: string;
  status: PaymentStatus;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  orderData?: any;
  order?: string; // Order ids are custom strings (e.g. "F240926725404"), not ObjectIds
  /** Top-ups only: the rupees added to the order's price. */
  topupAmount?: number;
  /** Top-ups only: refunded on its own (the order's refund fields cover its first payment). */
  topupRefundStatus?: "pending" | "processed" | "failed";
  topupRazorpayRefundId?: string;
  returnUrl?: string;
  language?: string;
  lockExpiresAt?: Date;
  paidAt?: Date;
  flagReason?: string;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    purpose: { type: String, enum: ["order", "topup"], default: "order" },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.CREATED,
      index: true,
    },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String, unique: true, sparse: true },
    orderData: { type: Schema.Types.Mixed },
    order: { type: String, ref: "Order" },
    topupAmount: { type: Number },
    topupRefundStatus: { type: String, enum: ["pending", "processed", "failed"] },
    topupRazorpayRefundId: { type: String },
    returnUrl: { type: String },
    language: { type: String },
    lockExpiresAt: { type: Date },
    paidAt: { type: Date },
    flagReason: { type: String },
    lastError: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model<IPayment>("Payment", PaymentSchema);
