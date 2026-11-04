// Pure helpers (no model imports, so any schema can use them) that remove credentials and
// identity / bank details from a plain object that is about to be serialized to a client.

const DRIVER_PRIVATE_FIELDS = [
  "aadhaarNumber",
  "aadhaarVerified",
  "panNumber",
  "panVerified",
  "panImage",
  "kycSource",
  "digilockerVerified",
  "digilockerVerifiedAt",
  "digilockerId",
  "dlNumber",
  "dlExpiry",
  "dlVerified",
  "dlVehicleClass",
  "dlFrontImage",
  "dlBackImage",
  "bankAccountNumber",
  "bankIfsc",
  "bankVerified",
  "bankAccounts",
  "payoutLockUntil",
  "selfieImage",
  "verificationReview",
  "expoPushTokens",
  "webPushSubscriptions",
];

const VENDOR_PRIVATE_FIELDS = [
  "password",
  "webPushSubscriptions",
  "expoPushTokens",
  "kyc",
  "owner",
  "contract",
  "verificationReview",
  "commissionRate",
  "payoutLockUntil",
];

const VENDOR_PRIVATE_LEGAL_FIELDS = ["panNumber", "panVerified", "panFileName", "bankAccount", "accountType", "ifsc", "ifscVerified", "chequeFileName"];

const isPlainRecord = (value: unknown): value is Record<string, any> =>
  !!value && typeof value === "object" && !Array.isArray(value) && !(value as any)._bsontype;

/** Drops identity documents, bank details and push tokens from a populated Driver. Mutates and returns it. */
export function scrubDriverSecrets<T>(driver: T): T {
  if (!isPlainRecord(driver)) return driver;
  for (const key of DRIVER_PRIVATE_FIELDS) delete driver[key];
  return driver;
}

/** Drops credentials, KYC and bank details from a populated Vendor / MeatCenter. Mutates and returns it. */
export function scrubVendorSecrets<T>(vendor: T): T {
  if (!isPlainRecord(vendor)) return vendor;
  for (const key of VENDOR_PRIVATE_FIELDS) delete vendor[key];
  if (isPlainRecord(vendor.legal)) {
    for (const key of VENDOR_PRIVATE_LEGAL_FIELDS) delete vendor.legal[key];
  }
  return vendor;
}
