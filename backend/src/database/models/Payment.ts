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
  purpose: "order";
  amount: number; // paise
  currency: string;
  status: PaymentStatus;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  orderData?: any;
  order?: string; // Order ids are custom strings (e.g. "F240926725404"), not ObjectIds
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
    purpose: { type: String, enum: ["order"], default: "order" },
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
