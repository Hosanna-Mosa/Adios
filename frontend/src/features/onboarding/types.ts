export type PartnerType = "food" | "meat";

export interface MenuItem {
  id: string;
  name: string;
  price: string;
  description: string;
  isVeg: boolean;
  isBestseller: boolean;
  photo: File | null;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface UploadedMenuRow {
  id: string;
  category: string;
  itemName: string;
  price: string;
  description: string;
  type: string;
  isBestseller: string;
  image: File | null;
}

export type DayTimeSlots = Record<string, { open: string; close: string }[]>;

/** Owner identity read from DigiLocker (see useDigilockerVerification). */
export interface DigilockerKyc {
  sessionId: string;
  sandbox: boolean;
  holderName?: string;
  dob?: string;
  gender?: string;
  maskedAadhaar?: string;
  aadhaarVerified: boolean;
  panNumber?: string;
  panName?: string;
  issuedDocuments: string[];
  /** Documents the owner's DigiLocker had none of, e.g. ["pan"]. */
  skipped: string[];
}

/** Document groups on the KYC step; also what an admin can ask for again. */
export type KycSection = "identity" | "pan" | "gst" | "fssai" | "bank";

/** An applicant's own view of their application (POST /vendors/onboarding/application). */
export interface PartnerApplication {
  name: string;
  partnerType: PartnerType;
  onboardingStatus:
    | "draft"
    | "submitted"
    | "approved"
    | "rejected"
    | "resubmission_required";
  verificationReview: {
    requestedDocuments: KycSection[];
    note?: string;
    rejectionReason?: string;
  };
  kyc: {
    holderName?: string;
    maskedAadhaar?: string;
    panNumber?: string;
  } | null;
}
