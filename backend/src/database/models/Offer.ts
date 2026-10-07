import mongoose, { Schema, Document } from "mongoose";

/**
 * An admin-curated restaurant offer, listed on the customer app's Offers page.
 * Purely promotional: the discount is redeemed through `couponCode` (a Coupon),
 * not applied from this document.
 */
export interface IOffer extends Document {
  title: string;
  description?: string;
  vendor: mongoose.Types.ObjectId;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  maxDiscount?: number;
  minOrderValue?: number;
  couponCode?: string;
  imageUrl?: string;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    vendor: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    discountType: { type: String, enum: ["PERCENTAGE", "FLAT"], required: true },
    discountValue: { type: Number, required: true },
    maxDiscount: { type: Number },
    minOrderValue: { type: Number, default: 0 },
    couponCode: { type: String, trim: true, uppercase: true },
    imageUrl: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

OfferSchema.index({ isActive: 1, displayOrder: 1, createdAt: -1 });

export default mongoose.model<IOffer>("Offer", OfferSchema);
