import mongoose, { Document, Schema } from "mongoose";

export enum DriverPayoutStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  PROCESSED = "processed",
  FAILED = "failed",
  /** The admin could not pay the bank account on file and asked the driver for other details. The amount stays reserved. */
  NEEDS_BANK_DETAILS = "needs_bank_details",
}

export interface IDriverPayout extends Document {
  driver: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  amount: number;
  status: DriverPayoutStatus;
  razorpayContactId?: string;
  razorpayFundAccountId?: string;
  razorpayPayoutId?: string;
  failureReason?: string;
  // Set only when RazorpayX reports the payout processed (API answer or verified webhook).
  processedAt?: Date;
  utr?: string;
  // "manual": an admin transferred the money and recorded the reference (until RazorpayX).
  method?: "razorpayx" | "manual";
  /** The admin who marked it paid or rejected it. */
  handledBy?: mongoose.Types.ObjectId;
  adminNote?: string;
  /** Why the admin asked for other bank details (status needs_bank_details). */
  bankIssue?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DriverPayoutSchema = new Schema(
  {
    driver: { type: Schema.Types.ObjectId, ref: "Driver", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(DriverPayoutStatus),
      default: DriverPayoutStatus.PENDING,
    },
    razorpayContactId: { type: String },
    razorpayFundAccountId: { type: String },
    razorpayPayoutId: { type: String },
    failureReason: { type: String },
    processedAt: { type: Date },
    utr: { type: String },
    method: { type: String, enum: ["razorpayx", "manual"] },
    handledBy: { type: Schema.Types.ObjectId, ref: "User" },
    adminNote: { type: String },
    bankIssue: { type: String },
  },
  { timestamps: true },
);

DriverPayoutSchema.index({ driver: 1, createdAt: -1 });

export default mongoose.model<IDriverPayout>("DriverPayout", DriverPayoutSchema);
