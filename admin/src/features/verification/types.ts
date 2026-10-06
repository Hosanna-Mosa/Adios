export type VerificationKind = "drivers" | "vendors";

export interface VerificationReview {
  requestedDocuments?: string[];
  note?: string;
  rejectionReason?: string;
  requestedAt?: string;
  reviewedAt?: string;
  resubmittedAt?: string;
}

export interface DriverApplication {
  _id: string;
  user?: { _id?: string; name?: string; phone?: string; email?: string; profilePic?: string };
  onboardingStatus?: string;
  status?: string;
  vehicleType?: string;
  gender?: string;
  preferredZone?: { _id: string; name: string } | string | null;
  aadhaarNumber?: string;
  aadhaarVerified?: boolean;
  panNumber?: string;
  panVerified?: boolean;
  panImage?: string;
  dlNumber?: string;
  dlExpiry?: string;
  dlVerified?: boolean;
  dlVehicleClass?: string;
  dlFrontImage?: string;
  dlBackImage?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankVerified?: boolean;
  selfieImage?: string;
  kycSource?: "self" | "surepass" | "digilocker";
  digilockerVerified?: boolean;
  digilockerVerifiedAt?: string;
  submittedForReviewAt?: string;
  verificationReview?: VerificationReview;
  createdAt?: string;
}

export interface VendorApplication {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  partnerType?: "food" | "meat";
  address?: string;
  categories?: string[];
  onboardingStatus?: string;
  onboardingSource?: string;
  submittedAt?: string;
  owner?: { name?: string; email?: string; phone?: string; primaryContact?: string };
  kyc?: {
    digilockerVerified?: boolean;
    verifiedAt?: string;
    sandbox?: boolean;
    holderName?: string;
    dob?: string;
    gender?: string;
    maskedAadhaar?: string;
    aadhaarVerified?: boolean;
    panNumber?: string;
    panName?: string;
    issuedDocuments?: string[];
  };
  legal?: {
    panNumber?: string;
    panVerified?: boolean;
    panFileName?: string;
    gstin?: string;
    gstFileName?: string;
    gstExempt?: boolean;
    fssaiNumber?: string;
    fssaiExpiry?: string;
    fssaiFileName?: string;
    bankAccount?: string;
    accountType?: string;
    ifsc?: string;
    ifscVerified?: boolean;
    chequeFileName?: string;
  };
  contract?: { acceptedTos?: boolean; signature?: string; signedAt?: string };
  verificationReview?: VerificationReview;
  createdAt?: string;
}

export interface VerificationQueueResponse {
  drivers?: DriverApplication[];
  vendors?: VendorApplication[];
  /** Applications per status, for the filter tabs. */
  counts: Record<string, number>;
}

/** A document group an admin can ask for again, as the backend names it. */
export interface DocumentOption {
  value: string;
  label: string;
}
