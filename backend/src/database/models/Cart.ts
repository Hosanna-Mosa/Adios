import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem {
  itemId: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  isVeg?: boolean;
  image?: string;
  images?: string[];
  quantity: number;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  vendor?: string | null;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

// strict:false keeps any extra per-item field the client already carries (add-ons, tags, …)
// instead of silently dropping it on the round trip.
const CartItemSchema: Schema = new Schema(
  {
    itemId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, default: "" },
    isVeg: { type: Boolean, default: true },
    image: { type: String },
    images: [{ type: String }],
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false, strict: false }
);

// `vendor` is a plain String, not an ObjectId ref: the cart's outlet can be either a food
// Vendor or a MeatCenter, so a single ref would be wrong for half the carts.
const CartSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    vendor: { type: String, default: null },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<ICart>("Cart", CartSchema);
