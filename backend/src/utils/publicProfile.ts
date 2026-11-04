import { Request } from "express";
import User, { UserRole } from "../database/models/User";
import RevokedToken from "../database/models/RevokedToken";

// Vendor, MeatCenter and Driver documents carry credentials, bank and KYC details. Anything
// that is sent to a customer, a driver or an anonymous caller goes through one of the helpers
// below instead of being serialized as-is. `.lean()` queries and `aggregate()` skip a schema's
// toJSON, so the stripping has to happen explicitly at the response.

const CREDENTIAL_FIELDS = ["password", "webPushSubscriptions", "expoPushTokens"];

// Back-office data nobody but the outlet itself and admins has a reason to read.
const BACK_OFFICE_VENDOR_FIELDS = [
  "kyc",
  "owner",
  "contract",
  "verificationReview",
  "commissionRate",
  "payoutLockUntil",
  "onboardingStatus",
  "onboardingSource",
  "submittedAt",
];

// The customer app shows the licence number on the restaurant screen; the rest of `legal`
// (PAN, GSTIN, bank account, IFSC, cheque) stays private.
const PUBLIC_LEGAL_FIELDS = ["fssaiNumber", "fssaiExpiry"];

const toPlain = (doc: any): Record<string, any> =>
  doc && typeof doc.toObject === "function" ? doc.toObject() : { ...doc };

/** A vendor / meat centre as an admin may see it: everything except credentials and push tokens. */
export function toAdminVendor<T = any>(doc: any): T {
  if (!doc) return doc;
  const out = toPlain(doc);
  for (const key of CREDENTIAL_FIELDS) delete out[key];
  return out as T;
}

/** A vendor / meat centre as a customer or anonymous caller may see it. */
export function toPublicVendor<T = any>(doc: any): T {
  if (!doc) return doc;
  const out = toAdminVendor<Record<string, any>>(doc);
  for (const key of BACK_OFFICE_VENDOR_FIELDS) delete out[key];
  if (out.legal && typeof out.legal === "object") {
    out.legal = Object.fromEntries(PUBLIC_LEGAL_FIELDS.filter((k) => out.legal[k] !== undefined).map((k) => [k, out.legal[k]]));
  }
  return out as T;
}

/**
 * True only for a fully valid admin session: the same checks authenticateToken makes (signature
 * already verified by optionalAuth, then revocation, token version and block flag), but answering
 * a boolean so a public endpoint can serve admins more without rejecting everyone else.
 */
export async function isVerifiedAdmin(req: Request): Promise<boolean> {
  const caller = (req as any).user as { userId?: string; role?: string; jti?: string; tv?: number } | undefined;
  if (!caller?.userId || caller.role !== UserRole.ADMIN) return false;
  if (caller.jti && (await RevokedToken.findOne({ jti: caller.jti }).select("_id").lean())) return false;
  const user = await User.findById(caller.userId).select("role tokenVersion isBlocked").lean();
  if (!user || user.role !== UserRole.ADMIN || user.isBlocked) return false;
  return (caller.tv ?? 0) === (user.tokenVersion ?? 0);
}
