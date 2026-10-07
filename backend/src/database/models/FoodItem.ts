import mongoose, { Schema, Document } from "mongoose";

export interface IFoodItem extends Document {
  vendorId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  isAvailable: boolean;
  isVeg: boolean;
  /** Discounted price; must be > 0 and < price. null/absent = no offer. */
  offerPrice?: number | null;
  /** Grams of protein per serving. */
  protein?: number | null;
  /** kcal per serving. */
  calories?: number | null;
  /**
   * Owner-promoted bestseller threshold. null/absent = not promoted, 0 = show the
   * badge right away, X > 0 = show it once the dish has been ordered X times.
   */
  bestsellerMinOrders?: number | null;
}

const FoodItemSchema: Schema = new Schema(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    images: { type: [String], default: [] },
    category: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    isVeg: { type: Boolean, default: false },
    offerPrice: { type: Number, default: null },
    protein: { type: Number, default: null },
    calories: { type: Number, default: null },
    bestsellerMinOrders: { type: Number, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IFoodItem>("FoodItem", FoodItemSchema);
