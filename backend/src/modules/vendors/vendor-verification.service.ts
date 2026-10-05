import Vendor, {
  IVendor,
  VENDOR_RESUBMITTABLE_DOCUMENTS,
  VendorResubmittableDocument,
} from "../../database/models/Vendor";
import { digilockerModuleService, VendorDigilockerKyc } from "../digilocker/digilocker.service";

/**
 * Vendor application verification — shared by the first submission from the
 * partner website, a resubmission after an admin asked for documents again,
 * the vendor-portal login gate, and the admin Restaurant Verification page.
 */

export const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;

/** The onboarding form only sends file metadata, never the file itself. */
export const fileName = (file?: { name?: string } | null) => file?.name || undefined;

const normalizePan = (value: unknown) => String(value || "").trim().toUpperCase();

/** Does the PAN the applicant entered match the one DigiLocker returned? */
export const isPanDigilockerVerified = (panNumber: unknown, kyc?: { panNumber?: string } | null) =>
  Boolean(kyc?.panNumber && normalizePan(panNumber) === kyc.panNumber);

/** The Vendor.kyc subdocument for a DigiLocker result. */
export function toVendorKycFields(kyc: VendorDigilockerKyc): NonNullable<IVendor["kyc"]> {
  return {
    source: "digilocker",
    digilockerVerified: true,
    verifiedAt: new Date(),
    sandbox: kyc.sandbox,
    digilockerId: kyc.digilockerId,
    holderName: kyc.holderName,
    dob: kyc.dob,
    gender: kyc.gender,
    maskedAadhaar: kyc.maskedAadhaar,
    aadhaarVerified: kyc.aadhaarVerified,
    panNumber: kyc.panNumber,
    panName: kyc.panName,
    issuedDocuments: kyc.issuedDocuments,
  };
}

/**
 * Claim the DigiLocker consent referenced by a payload for `vendorId`, or
 * return null when the payload carries none. Throws DigiLockerSessionError
 * (with a statusCode) when a reference is present but unusable.
 */
export async function claimDigilockerKyc(payload: any, vendorId: string): Promise<VendorDigilockerKyc | null> {
  if (!payload?.digilockerSessionId) return null;
  return digilockerModuleService.claimVendorOnboardingKyc(
    String(payload.digilockerSessionId),
    payload.digilockerKey ? String(payload.digilockerKey) : undefined,
    vendorId
  );
}

/** Labels of the fields still missing for one document group. */
export function missingDocumentFields(
  document: VendorResubmittableDocument,
  payload: any,
  kyc: { panNumber?: string; digilockerVerified?: boolean } | null
): string[] {
  const missing: string[] = [];

  switch (document) {
    case "identity":
      if (!kyc) missing.push("DigiLocker identity verification");
      break;
    case "pan":
      if (!PAN_PATTERN.test(normalizePan(payload.panNumber))) missing.push("PAN number");
      // A PAN DigiLocker already confirmed needs no copy; any other PAN does.
      if (!isPanDigilockerVerified(payload.panNumber, kyc) && !fileName(payload.panFile)) missing.push("PAN file");
      break;
    case "gst":
      if (!payload.gstExempt) {
        if (typeof payload.gstin !== "string" || payload.gstin.trim().length === 0) missing.push("GSTIN");
        if (!fileName(payload.gstFile)) missing.push("GST file");
      }
      break;
    case "fssai":
      if (!/^\d{14}$/.test(String(payload.fssaiNumber || ""))) missing.push("FSSAI number");
      if (typeof payload.fssaiExpiry !== "string" || payload.fssaiExpiry.trim().length === 0) missing.push("FSSAI expiry");
      if (!fileName(payload.fssaiFile)) missing.push("FSSAI file");
      break;
    case "bank":
      if (String(payload.bankAccount || "").length < 9) missing.push("Bank account number");
      if (payload.bankAccount !== payload.bankConfirm) missing.push("Matching bank account confirmation");
      if (!IFSC_PATTERN.test(String(payload.ifsc || ""))) missing.push("IFSC code");
      if (!fileName(payload.chequeFile)) missing.push("Cancelled cheque / bank statement");
      break;
  }

  return missing;
}

/** Dot-path `$set` fields that replace one document group on the vendor. */
export function legalUpdateFor(
  document: VendorResubmittableDocument,
  payload: any,
  kyc: { panNumber?: string } | null
): Record<string, unknown> {
  switch (document) {
    case "pan":
      return {
        "legal.panNumber": normalizePan(payload.panNumber),
        "legal.panVerified": isPanDigilockerVerified(payload.panNumber, kyc),
        "legal.panFileName": fileName(payload.panFile),
      };
    case "gst":
      return {
        "legal.gstExempt": Boolean(payload.gstExempt),
        "legal.gstin": payload.gstExempt ? undefined : payload.gstin,
        "legal.gstFileName": payload.gstExempt ? undefined : fileName(payload.gstFile),
      };
    case "fssai":
      return {
        "legal.fssaiNumber": payload.fssaiNumber,
        "legal.fssaiExpiry": payload.fssaiExpiry,
        "legal.fssaiFileName": fileName(payload.fssaiFile),
      };
    case "bank":
      return {
        "legal.bankAccount": payload.bankAccount,
        "legal.accountType": payload.accountType === "current" ? "current" : "savings",
        "legal.ifsc": payload.ifsc,
        // Not checked on the form any more; an admin reviews bank details.
        "legal.ifscVerified": false,
        "legal.chequeFileName": fileName(payload.chequeFile),
      };
    default:
      return {};
  }
}

export const isResubmittableDocument = (value: unknown): value is VendorResubmittableDocument =>
  (VENDOR_RESUBMITTABLE_DOCUMENTS as readonly string[]).includes(String(value));

/** Look a vendor up by the email/phone + password they use for the portal. */
export async function findVendorByCredentials(body: any): Promise<IVendor | null> {
  const email = String(body?.email || "").trim().toLowerCase();
  const phone = String(body?.phone || "").replace(/\D/g, "");
  const password = String(body?.password || "");

  if (!password || (!email && !phone)) return null;

  const vendor = await Vendor.findOne({
    $or: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
  });

  if (!vendor?.password || !(await vendor.matchPassword(password))) return null;
  return vendor;
}

export interface VendorAccessBlock {
  code:
    | "VENDOR_ONBOARDING_INCOMPLETE"
    | "VENDOR_PENDING_APPROVAL"
    | "VENDOR_RESUBMISSION_REQUIRED"
    | "VENDOR_REJECTED";
  message: string;
  onboardingStatus: string;
  requestedDocuments?: string[];
  note?: string;
  rejectionReason?: string;
}

/**
 * Why this vendor may not use the vendor portal yet, or null when it may.
 *
 * Every application from the partner website waits for an admin's approval.
 * Vendors an admin created, or that predate `onboardingSource`, are left alone
 * unless they are in a review status — so existing logins keep working.
 */
export function getVendorAccessBlock(vendor: IVendor): VendorAccessBlock | null {
  const status = vendor.onboardingStatus;
  const review = vendor.verificationReview;

  switch (status) {
    case "approved":
    case undefined:
      return null;
    case "draft":
      if (vendor.onboardingSource !== "partner_website") return null;
      return {
        code: "VENDOR_ONBOARDING_INCOMPLETE",
        message: "Your partner application has not been submitted yet. Please complete onboarding on the partner website.",
        onboardingStatus: status,
      };
    case "submitted":
      return {
        code: "VENDOR_PENDING_APPROVAL",
        message: "Your application is under review. You can sign in once our team approves it.",
        onboardingStatus: status,
      };
    case "resubmission_required":
      return {
        code: "VENDOR_RESUBMISSION_REQUIRED",
        message: "Our team needs some of your documents again before your application can be approved.",
        onboardingStatus: status,
        requestedDocuments: review?.requestedDocuments || [],
        note: review?.note,
      };
    case "rejected":
      return {
        code: "VENDOR_REJECTED",
        message: "Your partner application was not approved. Please contact support for details.",
        onboardingStatus: status,
        rejectionReason: review?.rejectionReason,
      };
    default:
      return null;
  }
}

const maskTail = (value?: string, visible = 4) =>
  value ? `${"X".repeat(Math.max(0, value.length - visible))}${value.slice(-visible)}` : undefined;

/** What the applicant may see of their own application on the resubmit page. */
export function toApplicationSummary(vendor: IVendor) {
  const legal: NonNullable<IVendor["legal"]> = vendor.legal || {};
  return {
    name: vendor.name,
    partnerType: vendor.partnerType || "food",
    onboardingStatus: vendor.onboardingStatus,
    verificationReview: {
      requestedDocuments: vendor.verificationReview?.requestedDocuments || [],
      note: vendor.verificationReview?.note,
      rejectionReason: vendor.verificationReview?.rejectionReason,
      requestedAt: vendor.verificationReview?.requestedAt,
      resubmittedAt: vendor.verificationReview?.resubmittedAt,
    },
    kyc: vendor.kyc?.digilockerVerified
      ? {
          holderName: vendor.kyc.holderName,
          maskedAadhaar: vendor.kyc.maskedAadhaar,
          panNumber: vendor.kyc.panNumber,
          verifiedAt: vendor.kyc.verifiedAt,
        }
      : null,
    legal: {
      panNumber: legal.panNumber,
      panVerified: Boolean(legal.panVerified),
      gstExempt: Boolean(legal.gstExempt),
      gstin: legal.gstin,
      fssaiNumber: legal.fssaiNumber,
      fssaiExpiry: legal.fssaiExpiry,
      bankAccount: maskTail(legal.bankAccount),
      accountType: legal.accountType,
      ifsc: legal.ifsc,
    },
  };
}
