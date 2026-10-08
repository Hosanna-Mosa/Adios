import mongoose, { Schema, Document } from "mongoose";

export enum DriverStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
}

export enum OnboardingStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  /** Driver finished the flow; waiting for an admin to verify the documents. */
  PENDING_APPROVAL = "pending_approval",
  /** An admin asked the driver to provide some documents again. */
  RESUBMISSION_REQUIRED = "resubmission_required",
  /** Approved by an admin — the only status allowed to go online. */
  COMPLETED = "completed",
  REJECTED = "rejected",
}

/** Documents an admin can ask a driver to provide again. */
export const DRIVER_RESUBMITTABLE_DOCUMENTS = ["aadhaar", "pan", "license", "bank", "selfie"] as const;
export type DriverResubmittableDocument = (typeof DRIVER_RESUBMITTABLE_DOCUMENTS)[number];

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
  // When the driver's app last reported a location (socket or REST). A
  // minimised app keeps posting over REST with no live socket, so dispatch uses
  // this to tell "backgrounded but alive" apart from "app killed".
  lastLocationAt?: Date;
  // Compass bearing (0-360) from the latest location ping, so a polling customer
  // app can rotate the driver marker without the socket relay.
  heading?: number;
  // Onboarding fields
  onboardingStatus: OnboardingStatus;
  gender?: "male" | "female";
  vehicleType?: "bike" | "auto" | "car";
  preferredZone?: mongoose.Types.ObjectId;
  preferredZones?: mongoose.Types.ObjectId[];
  aadhaarNumber?: string;
  aadhaarVerified?: boolean;
  panNumber?: string;
  panVerified?: boolean;
  panImage?: string;
  // Where the identity above came from. "self" is a driver-typed number that
  // nothing has checked; "digilocker" means it was read out of a government
  // issuer via the driver's own DigiLocker consent, which is the only source
  // strong enough to treat aadhaarVerified/panVerified as authoritative.
  kycSource?: "self" | "surepass" | "digilocker";
  digilockerVerified?: boolean;
  digilockerVerifiedAt?: Date;
  digilockerId?: string;
  dlNumber?: string;
  dlExpiry?: Date;
  dlVerified?: boolean;
  /** Vehicle classes on the licence, e.g. "LMV, MCWG". */
  dlVehicleClass?: string;
  dlFrontImage?: string;
  dlBackImage?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankVerified?: boolean;
  // Short lock so two cash-out taps can't both pass the balance check.
  payoutLockUntil?: Date | null;
  bankAccounts?: {
    accountNumber: string;
    ifsc: string;
    verified: boolean;
    isDefault: boolean;
  }[];
  selfieImage?: string;
  onboardingCompletedAt?: Date;
  /** When the driver last sent the application for admin review. */
  submittedForReviewAt?: Date;
  /** The admin's latest verification decision on this driver. */
  verificationReview?: {
    requestedDocuments?: DriverResubmittableDocument[];
    note?: string;
    rejectionReason?: string;
    requestedAt?: Date;
    reviewedAt?: Date;
  };
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
    lastLocationAt: { type: Date },
    heading: { type: Number },
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
    panVerified: { type: Boolean, default: false },
    panImage: { type: String },
    kycSource: { type: String, enum: ["self", "surepass", "digilocker"] },
    digilockerVerified: { type: Boolean, default: false },
    digilockerVerifiedAt: { type: Date },
    digilockerId: { type: String },
    dlNumber: { type: String },
    dlExpiry: { type: Date },
    dlVerified: { type: Boolean, default: false },
    dlVehicleClass: { type: String },
    dlFrontImage: { type: String },
    dlBackImage: { type: String },
    bankAccountNumber: { type: String },
    bankIfsc: { type: String },
    bankVerified: { type: Boolean, default: false },
    payoutLockUntil: { type: Date, default: null },
    bankAccounts: [{
      accountNumber: { type: String },
      ifsc: { type: String },
      verified: { type: Boolean, default: false },
      isDefault: { type: Boolean, default: false },
    }],
    selfieImage: { type: String },
    onboardingCompletedAt: { type: Date },
    submittedForReviewAt: { type: Date },
    verificationReview: {
      requestedDocuments: { type: [String], enum: DRIVER_RESUBMITTABLE_DOCUMENTS, default: undefined },
      note: { type: String },
      rejectionReason: { type: String },
      requestedAt: { type: Date },
      reviewedAt: { type: Date },
    },
  },
  { timestamps: true }
);

DriverSchema.index({ currentLocation: "2dsphere" });

export default mongoose.model<IDriver>("Driver", DriverSchema);
