import mongoose, { Schema, Document } from "mongoose";

export interface IDigitalMenuRestaurant extends Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  isPureVeg: boolean;
  qrCodeUrl?: string;
  rating: number;
  reviews: string;
}

const DigitalMenuRestaurantSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    isPureVeg: { type: Boolean, default: false },
    qrCodeUrl: { type: String },
    // Unrated until real reviews exist — same defaults as Vendor, not an invented 4.0 / "1".
    rating: { type: Number, default: 0 },
    reviews: { type: String, default: "0" }
  },
  { timestamps: true }
);

export default mongoose.model<IDigitalMenuRestaurant>("DigitalMenuRestaurant", DigitalMenuRestaurantSchema);
