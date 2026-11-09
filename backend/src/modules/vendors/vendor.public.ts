/**
 * What a customer, driver or anonymous caller may see of a restaurant or meat
 * centre (Vendor or MeatCenter document).
 *
 * The business phone, email and FSSAI licence stay: the customer app shows them
 * on the outlet page, and the FSSAI number must be displayed to customers. The
 * rest of this list is the owner's identity and KYC, bank and tax details,
 * credentials, push endpoints and commercial terms — data for the vendor
 * themselves and for admin, never for the public menu or an order screen.
 */
const PRIVATE_VENDOR_PATHS = [
  "password",
  "owner",
  "kyc",
  "verificationReview",
  "contract",
  "commissionRate",
  "payoutLockUntil",
  "webPushSubscriptions",
  "expoPushTokens",
  "onboardingSource",
  "submittedAt",
  "legal.panNumber",
  "legal.panVerified",
  "legal.panFileName",
  "legal.gstin",
  "legal.gstFileName",
  "legal.gstExempt",
  "legal.fssaiFileName",
  "legal.bankAccount",
  "legal.accountType",
  "legal.ifsc",
  "legal.ifscVerified",
  "legal.chequeFileName",
  "operations.menuReferenceFileName",
  "operations.menuUploadValid",
  "operations.menuUploadRows",
] as const;

/** Mongoose `select` for populating an order's vendor for anyone but admin. */
export const PUBLIC_VENDOR_SELECT = PRIVATE_VENDOR_PATHS.map((path) => `-${path}`).join(" ");

/**
 * Strips the private fields from a plain (`.lean()`) vendor or meat-centre
 * object. Lean reads skip the schemas' toJSON transform, so every public
 * endpoint that answers with one goes through this.
 */
export function toPublicVendor<T extends Record<string, any>>(vendor: T): T {
  const copy: Record<string, any> = { ...vendor };
  for (const path of PRIVATE_VENDOR_PATHS) {
    const [head, child] = path.split(".");
    if (!child) {
      delete copy[head];
    } else if (copy[head] && typeof copy[head] === "object") {
      const nested = { ...copy[head] };
      delete nested[child];
      copy[head] = nested;
    }
  }
  return copy as T;
}
