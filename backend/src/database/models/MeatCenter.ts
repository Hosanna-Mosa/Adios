import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { WeeklyHours } from "../../utils/openingHours";

export interface IMeatCenter extends Document {
  name: string;
  phone: string;
  email: string;
  password: string;
  location: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
  address: string;
  image?: string;
  rating: number;
  reviews: string;
  categories: string[]; // e.g., ["Chicken", "Mutton", "Fish"]
  isOpen: boolean;
  openingHours?: WeeklyHours;
  isManuallyClosed: boolean;
  deliveryFee: number;
  minOrderValue: number;
  createdAt: Date;
  updatedAt: Date;
  matchPassword: (password: string) => Promise<boolean>;
}

// Mirrors Vendor.openingHours so one helper serves restaurants and meat centres.
const dayHoursDefinition = () => ({
  open: { type: String },
  close: { type: String },
  closed: { type: Boolean },
});

const openingHoursDefinition = () => ({
  mon: dayHoursDefinition(),
  tue: dayHoursDefinition(),
  wed: dayHoursDefinition(),
  thu: dayHoursDefinition(),
  fri: dayHoursDefinition(),
  sat: dayHoursDefinition(),
  sun: dayHoursDefinition(),
});

const MeatCenterSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    address: { type: String, required: true },
    image: { type: String },
    rating: { type: Number, default: 0 },
    reviews: { type: String, default: "0" },
    categories: { type: [String], default: [] },
    isOpen: { type: Boolean, default: true },
    openingHours: openingHoursDefinition(),
    isManuallyClosed: { type: Boolean, default: false },
    deliveryFee: { type: Number, default: 0 },
    minOrderValue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Hash password before saving
MeatCenterSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
});

// Match password
MeatCenterSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password as string);
};

MeatCenterSchema.index({ location: "2dsphere" });

export default mongoose.model<IMeatCenter>("MeatCenter", MeatCenterSchema);
