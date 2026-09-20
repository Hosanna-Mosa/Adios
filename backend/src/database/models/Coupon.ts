import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  maxDiscount?: number;
  minOrderValue?: number;
  expiryDate?: Date;
  isActive: boolean;
  usageCount: number;
  vendor?: mongoose.Types.ObjectId;
  title?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["PERCENTAGE", "FLAT"], required: true },
    discountValue: { type: Number, required: true },
    maxDiscount: { type: Number },
    minOrderValue: { type: Number, default: 0 },
    expiryDate: { type: Date },
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 },
    // Unset means the coupon is platform-wide; set scopes it to one restaurant.
    vendor: { type: Schema.Types.ObjectId, ref: "Vendor" },
    title: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ICoupon>("Coupon", CouponSchema);
