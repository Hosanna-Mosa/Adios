import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { webPushSubscriptionSchema, IWebPushSubscription } from "./WebPushSubscription";
import { WeeklyHours } from "../../utils/openingHours";

export type VendorOnboardingStatus = "draft" | "submitted" | "approved" | "rejected" | "resubmission_required";

/** Documents an admin can ask a vendor applicant to provide again. */
export const VENDOR_RESUBMITTABLE_DOCUMENTS = ["identity", "pan", "gst", "fssai", "bank"] as const;
export type VendorResubmittableDocument = (typeof VENDOR_RESUBMITTABLE_DOCUMENTS)[number];

export interface IVendor extends Document {
  name: string;
  email: string;
  phone: string;
  password?: string;
  googlePlaceId?: string;
  onboardingStatus?: VendorOnboardingStatus;
  /**
   * Where the record came from. Only applications from the partner website are
   * held back from the vendor portal until an admin approves them; vendors an
   * admin created (or that predate this field) keep signing in as before.
   */
  onboardingSource?: "partner_website" | "admin";
  submittedAt?: Date;
  /** The admin's latest verification decision on this application. */
  verificationReview?: {
    requestedDocuments?: VendorResubmittableDocument[];
    note?: string;
    rejectionReason?: string;
    requestedAt?: Date;
    reviewedAt?: Date;
    resubmittedAt?: Date;
  };
  /** Owner identity as read from DigiLocker, via the owner's own consent. */
  kyc?: {
    source?: "digilocker";
    digilockerVerified?: boolean;
    verifiedAt?: Date;
    sandbox?: boolean;
    digilockerId?: string;
    holderName?: string;
    dob?: string;
    gender?: string;
    maskedAadhaar?: string;
    aadhaarVerified?: boolean;
    panNumber?: string;
    panName?: string;
    issuedDocuments?: string[];
  };
  commissionRate?: number;
  // Short lock so two payout requests can't both pass the balance check.
  payoutLockUntil?: Date | null;
  partnerType?: "food" | "meat";
  owner?: {
    name?: string;
    email?: string;
    phone?: string;
    primaryContact?: string;
    otpVerified?: boolean;
  };
  location: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
  address: string;
  detailedAddress?: {
    shopNo?: string;
    floor?: string;
    area?: string;
    city?: string;
    landmark?: string;
    formattedAddress?: string;
  };
  image: string;
  rating: number;
  reviews: string;
  categories: string[];
  operations?: {
    selectedDays?: string[];
    timeSlots?: { open: string; close: string }[];
    dayTimeSlots?: Record<string, { open: string; close: string }[]>;
    menuSetupMode?: "upload" | "manual";
    menuReferenceFileName?: string;
    menuUploadValid?: boolean;
    menuUploadRows?: {
      category: string;
      itemName: string;
      price: string;
      description?: string;
      type?: string;
      isBestseller?: string;
      imageFileName?: string;
    }[];
    menuCategories?: {
      name: string;
      items: {
        name: string;
        price: string;
        description?: string;
        isVeg: boolean;
        isBestseller: boolean;
        photoFileName?: string;
      }[];
    }[];
  };
  legal?: {
    panNumber?: string;
    /** True when panNumber matches the PAN DigiLocker returned for the owner. */
    panVerified?: boolean;
    panFileName?: string;
    gstin?: string;
    gstFileName?: string;
    gstExempt?: boolean;
    fssaiNumber?: string;
    fssaiExpiry?: string;
    fssaiFileName?: string;
    bankAccount?: string;
    accountType?: "savings" | "current";
    ifsc?: string;
    ifscVerified?: boolean;
    chequeFileName?: string;
  };
  contract?: {
    acceptedTos?: boolean;
    signature?: string;
    signedAt?: Date;
  };
  isPureVeg: boolean;
  isOpen: boolean;
  openingHours?: WeeklyHours;
  isManuallyClosed: boolean;
  deliveryFee: number;
  minOrderValue: number;
  webPushSubscriptions?: IWebPushSubscription[];
  /** Expo push tokens of every device signed in to the partner app (owner's phone, kitchen tablet…). */
  expoPushTokens?: string[];
  createdAt: Date;
  updatedAt: Date;
  matchPassword: (password: string) => Promise<boolean>;
}

// One "HH:mm" window per day. No defaults on purpose: an outlet with no schedule
// must stay an empty object so evaluateOpenState() reads it as "always open".
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

const VendorSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String },
    googlePlaceId: { type: String },
    onboardingStatus: {
      type: String,
      enum: ["draft", "submitted", "approved", "rejected", "resubmission_required"],
      default: "draft",
    },
    onboardingSource: { type: String, enum: ["partner_website", "admin"] },
    submittedAt: { type: Date },
    verificationReview: {
      requestedDocuments: { type: [String], enum: VENDOR_RESUBMITTABLE_DOCUMENTS, default: undefined },
      note: { type: String },
      rejectionReason: { type: String },
      requestedAt: { type: Date },
      reviewedAt: { type: Date },
      resubmittedAt: { type: Date },
    },
    kyc: {
      source: { type: String, enum: ["digilocker"] },
      digilockerVerified: { type: Boolean },
      verifiedAt: { type: Date },
      sandbox: { type: Boolean },
      digilockerId: { type: String },
      holderName: { type: String },
      dob: { type: String },
      gender: { type: String },
      maskedAadhaar: { type: String },
      aadhaarVerified: { type: Boolean },
      panNumber: { type: String },
      panName: { type: String },
      issuedDocuments: { type: [String], default: undefined },
    },
    payoutLockUntil: { type: Date, default: null },
    commissionRate: {
      type: Number,
      default: 10,
    },
    partnerType: {
      type: String,
      enum: ["food", "meat"],
      default: "food",
    },
    owner: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
      primaryContact: { type: String },
      otpVerified: { type: Boolean, default: false },
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    address: { type: String, required: true },
    detailedAddress: {
      shopNo: { type: String },
      floor: { type: String },
      area: { type: String },
      city: { type: String },
      landmark: { type: String },
      formattedAddress: { type: String },
    },
    image: { type: String },
    rating: { type: Number, default: 0 },
    reviews: { type: String, default: "0" },
    categories: { type: [String], default: [] },
    operations: {
      selectedDays: { type: [String], default: [] },
      timeSlots: {
        type: [
          {
            open: { type: String },
            close: { type: String },
          },
        ],
        default: [],
      },
      dayTimeSlots: { type: Schema.Types.Mixed },
      menuSetupMode: { type: String, enum: ["upload", "manual"], default: "manual" },
      menuReferenceFileName: { type: String },
      menuUploadValid: { type: Boolean, default: false },
      menuUploadRows: {
        type: [
          {
            category: { type: String },
            itemName: { type: String },
            price: { type: String },
            description: { type: String },
            type: { type: String },
            isBestseller: { type: String },
            imageFileName: { type: String },
          },
        ],
        default: [],
      },
      menuCategories: {
        type: [
          {
            name: { type: String },
            items: [
              {
                name: { type: String },
                price: { type: String },
                description: { type: String },
                isVeg: { type: Boolean },
                isBestseller: { type: Boolean },
                photoFileName: { type: String },
              },
            ],
          },
        ],
        default: [],
      },
    },
    legal: {
      panNumber: { type: String },
      panVerified: { type: Boolean, default: false },
      panFileName: { type: String },
      gstin: { type: String },
      gstFileName: { type: String },
      gstExempt: { type: Boolean, default: false },
      fssaiNumber: { type: String },
      fssaiExpiry: { type: String },
      fssaiFileName: { type: String },
      bankAccount: { type: String },
      accountType: { type: String, enum: ["savings", "current"], default: "savings" },
      ifsc: { type: String },
      ifscVerified: { type: Boolean, default: false },
      chequeFileName: { type: String },
    },
    contract: {
      acceptedTos: { type: Boolean, default: false },
      signature: { type: String },
      signedAt: { type: Date },
    },
    isPureVeg: { type: Boolean, default: false },
    isOpen: { type: Boolean, default: true },
    openingHours: openingHoursDefinition(),
    isManuallyClosed: { type: Boolean, default: false },
    deliveryFee: { type: Number, default: 0 },
    minOrderValue: { type: Number, default: 0 },
    webPushSubscriptions: [webPushSubscriptionSchema],
    expoPushTokens: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Hash password before saving
VendorSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
});

// Match password
VendorSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password as string);
};

// Crucial for proximity sorting
VendorSchema.index({ location: "2dsphere" });

export default mongoose.model<IVendor>("Vendor", VendorSchema);
