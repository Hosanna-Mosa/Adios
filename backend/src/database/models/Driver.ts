import mongoose, { Schema, Document } from "mongoose";

export enum DriverStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
}

export enum OnboardingStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  REJECTED = "rejected",
}

export interface IDriver extends Document {
  user: mongoose.Types.ObjectId;
  status: DriverStatus;
  isAvailable: boolean;
  // Which order categories the driver has toggled on for this shift (set from
  // GoOnlineModal). Defaults to both for drivers on an app build predating this
  // field, or who have never set it, so dispatch treats them as unfiltered
  // rather than silently excluding them from every order. See
  // dispatch.config.ts's driverAcceptsServiceType for how this gates dispatch.
  activeServices: ("ride" | "food")[];
  currentLocation?: {
    type: string;
    coordinates: number[];
  };
  // Onboarding fields
  onboardingStatus: OnboardingStatus;
  gender?: "male" | "female";
  vehicleType?: "bike" | "auto" | "car";
  preferredZone?: mongoose.Types.ObjectId;
  preferredZones?: mongoose.Types.ObjectId[];
  aadhaarNumber?: string;
  aadhaarVerified?: boolean;
  panNumber?: string;
  panImage?: string;
  dlNumber?: string;
  dlExpiry?: Date;
  dlFrontImage?: string;
  dlBackImage?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankVerified?: boolean;
  bankAccounts?: {
    accountNumber: string;
    ifsc: string;
    verified: boolean;
    isDefault: boolean;
  }[];
  selfieImage?: string;
  onboardingCompletedAt?: Date;
  homeMode: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: Object.values(DriverStatus),
      default: DriverStatus.OFFLINE,
    },
    isAvailable: { type: Boolean, default: true },
    activeServices: {
      type: [String],
      enum: ["ride", "food"],
      default: ["ride", "food"],
    },
    homeMode: { type: Boolean, default: false },
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    // Onboarding fields
    onboardingStatus: {
      type: String,
      enum: Object.values(OnboardingStatus),
      default: OnboardingStatus.NOT_STARTED,
    },
    gender: { type: String, enum: ["male", "female"] },
    vehicleType: { type: String, enum: ["bike", "auto", "car"] },
    preferredZone: { type: Schema.Types.ObjectId, ref: "Zone" },
    preferredZones: [{ type: Schema.Types.ObjectId, ref: "Zone" }],
    aadhaarNumber: { type: String },
    aadhaarVerified: { type: Boolean, default: false },
    panNumber: { type: String },
    panImage: { type: String },
    dlNumber: { type: String },
    dlExpiry: { type: Date },
    dlFrontImage: { type: String },
    dlBackImage: { type: String },
    bankAccountNumber: { type: String },
    bankIfsc: { type: String },
    bankVerified: { type: Boolean, default: false },
    bankAccounts: [{
      accountNumber: { type: String },
      ifsc: { type: String },
      verified: { type: Boolean, default: false },
      isDefault: { type: Boolean, default: false },
    }],
    selfieImage: { type: String },
    onboardingCompletedAt: { type: Date },
  },
  { timestamps: true }
);

DriverSchema.index({ currentLocation: "2dsphere" });

export default mongoose.model<IDriver>("Driver", DriverSchema);
