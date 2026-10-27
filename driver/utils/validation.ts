/**
 * Field rules for sign-up, sign-in and onboarding: one place, pure functions, no React.
 *
 * Every validator returns `null` when the value is good, or an error code. `fieldMessage` turns a
 * code into the driver's language (`validation.<code>` in the locales) with an English fallback.
 * The backend repeats the rules that matter (phone, name, password, bank) and never trusts these.
 */

export type ValidationCode =
  | "nameRequired" | "nameLength" | "nameChars"
  | "phoneRequired" | "phoneInvalid"
  | "emailRequired" | "emailInvalid"
  | "passwordRequired" | "passwordShort" | "passwordLong" | "passwordMix"
  | "confirmRequired" | "confirmMismatch"
  | "otpInvalid"
  | "aadhaarRequired" | "aadhaarInvalid"
  | "panRequired" | "panInvalid"
  | "dlRequired" | "dlInvalid"
  | "expiryRequired" | "expiryPast" | "expiryTooFar"
  | "addressRequired" | "addressShort" | "addressLong" | "addressNotPicked"
  | "accountRequired" | "accountLength" | "accountInvalid"
  | "accountMismatch"
  | "ifscRequired" | "ifscInvalid";

const FALLBACK: Record<ValidationCode, string> = {
  nameRequired: "Enter your full name.",
  nameLength: "Your name must be 2 to 60 characters.",
  nameChars: "Use letters only (spaces, . ' and - are fine).",
  phoneRequired: "Enter your mobile number.",
  phoneInvalid: "Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.",
  emailRequired: "Enter your email address.",
  emailInvalid: "Enter a valid email address, like you@example.com.",
  passwordRequired: "Enter a password.",
  passwordShort: "Use at least 8 characters.",
  passwordLong: "Use 64 characters or fewer.",
  passwordMix: "Use at least one letter and one number.",
  confirmRequired: "Re-enter your password.",
  confirmMismatch: "The two passwords don't match.",
  otpInvalid: "Enter the 6-digit code.",
  aadhaarRequired: "Enter your Aadhaar number.",
  aadhaarInvalid: "That Aadhaar number isn't valid. It has 12 digits, like 2345 6789 0123. Check each digit.",
  panRequired: "Enter your PAN number.",
  panInvalid: "That PAN isn't valid. It looks like ABCPE1234F.",
  dlRequired: "Enter your driving license number.",
  dlInvalid: "That license number isn't valid. Example: HR-06-2020-1234567.",
  expiryRequired: "Choose your license expiry date.",
  expiryPast: "Your license has expired. Use a license that is still valid.",
  expiryTooFar: "That expiry date is too far ahead. Check the date.",
  addressRequired: "Enter your home address.",
  addressShort: "Enter the full address (at least 10 characters).",
  addressLong: "The address is too long (200 characters at most).",
  addressNotPicked: "Pick your address from the suggestions so we can find it on the map.",
  accountRequired: "Enter your bank account number.",
  accountLength: "An account number has 9 to 18 digits.",
  accountInvalid: "That account number isn't valid.",
  accountMismatch: "The account numbers don't match.",
  ifscRequired: "Enter the IFSC code.",
  ifscInvalid: "That IFSC isn't valid. It looks like SBIN0001234.",
};

/** The message for a code, in the current language. `t` is i18next's `t`. */
export function fieldMessage(
  t: (key: string, options?: Record<string, unknown>) => string,
  code: ValidationCode | null,
): string | undefined {
  return code ? t(`validation.${code}`, { defaultValue: FALLBACK[code] }) : undefined;
}

// ─── Sign-in / sign-up ────────────────────────────────────────────────────────

const NAME_CHARS = /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u;

/** A person's name (sign-up, and the name on a PAN card). */
export function validatePersonName(value: string): ValidationCode | null {
  const name = value.trim().replace(/\s+/g, " ");
  if (!name) return "nameRequired";
  if (name.length < 2 || name.length > 60) return "nameLength";
  if (!NAME_CHARS.test(name)) return "nameChars";
  return null;
}

/** An Indian mobile number without +91: ten digits, starting 6–9. */
export function validatePhone(value: string): ValidationCode | null {
  if (!value) return "phoneRequired";
  return /^[6-9]\d{9}$/.test(value) ? null : "phoneInvalid";
}

export function validateEmail(value: string): ValidationCode | null {
  const email = value.trim();
  if (!email) return "emailRequired";
  const [local = "", domain = ""] = email.split("@");
  const shapeOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  if (!shapeOk || email.length > 254 || local.length > 64 || email.includes("..") || domain.startsWith(".") || domain.startsWith("-")) {
    return "emailInvalid";
  }
  return null;
}

/** The password a new account sets (sign-in only needs it to be non-empty). */
export function validateNewPassword(value: string): ValidationCode | null {
  if (!value) return "passwordRequired";
  if (value.length < 8) return "passwordShort";
  if (value.length > 64) return "passwordLong";
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return "passwordMix";
  return null;
}

export function validateConfirmPassword(password: string, confirm: string): ValidationCode | null {
  if (!confirm) return "confirmRequired";
  return password === confirm ? null : "confirmMismatch";
}

export function validateOtp(value: string): ValidationCode | null {
  return /^\d{6}$/.test(value) ? null : "otpInvalid";
}

// ─── Identity documents ───────────────────────────────────────────────────────

// Verhoeff checksum: the last digit of every Aadhaar number, so one wrong or swapped digit is caught.
const V_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 0, 6, 7, 8, 9, 5], [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7], [4, 0, 1, 2, 3, 9, 5, 6, 7, 8], [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2], [7, 6, 5, 9, 8, 2, 1, 0, 4, 3], [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];
const V_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 5, 7, 6, 2, 8, 3, 0, 9, 4], [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7], [9, 4, 5, 3, 1, 2, 6, 8, 7, 0], [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5], [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];
const V_INV = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

/** True when the digits (check digit included) pass the Verhoeff checksum. */
export function verhoeffValid(digits: string): boolean {
  let c = 0;
  const reversed = digits.split("").reverse();
  for (let i = 0; i < reversed.length; i++) c = V_D[c][V_P[i % 8][Number(reversed[i])]];
  return c === 0;
}

/** The check digit to append to `digits` (used by tests). */
export function verhoeffCheckDigit(digits: string): number {
  let c = 0;
  const reversed = digits.split("").reverse();
  for (let i = 0; i < reversed.length; i++) c = V_D[c][V_P[(i + 1) % 8][Number(reversed[i])]];
  return V_INV[c];
}

/** A 12-digit Aadhaar number (spaces allowed): first digit 2–9 and a correct checksum. */
export function validateAadhaar(value: string): ValidationCode | null {
  const digits = value.replace(/\s/g, "");
  if (!digits) return "aadhaarRequired";
  if (!/^[2-9]\d{11}$/.test(digits) || !verhoeffValid(digits)) return "aadhaarInvalid";
  return null;
}

// 4th letter of a PAN is the holder type: A AOP, B BOI, C company, F firm, G govt, H HUF, J juridical, L local, P person, T trust.
export function validatePan(value: string): ValidationCode | null {
  const pan = value.trim().toUpperCase();
  if (!pan) return "panRequired";
  return /^[A-Z]{3}[ABCFGHLJPT][A-Z]\d{4}[A-Z]$/.test(pan) ? null : "panInvalid";
}

/** State code (2 letters) + RTO (2 digits) + year issued (1950 to now) + 7-digit serial. */
export function validateLicenseNumber(value: string, now: Date = new Date()): ValidationCode | null {
  const dl = value.replace(/[\s-]/g, "").toUpperCase();
  if (!dl) return "dlRequired";
  const match = /^[A-Z]{2}\d{2}(\d{4})\d{7}$/.exec(dl);
  if (!match) return "dlInvalid";
  const year = Number(match[1]);
  return year >= 1950 && year <= now.getFullYear() ? null : "dlInvalid";
}

/** A licence is valid through its expiry day; nothing in the past, nothing absurdly far ahead. */
export function validateLicenseExpiry(date: Date | null | undefined, now: Date = new Date()): ValidationCode | null {
  if (!date || Number.isNaN(date.getTime())) return "expiryRequired";
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (day < today) return "expiryPast";
  if (day.getFullYear() > now.getFullYear() + 50) return "expiryTooFar";
  return null;
}

// ─── Address and bank ─────────────────────────────────────────────────────────

/** `located` = the driver picked a suggestion, so the address has a map position. */
export function validateHomeAddress(value: string, located: boolean): ValidationCode | null {
  const address = value.trim();
  if (!address) return "addressRequired";
  if (address.length < 10) return "addressShort";
  if (address.length > 200) return "addressLong";
  return located ? null : "addressNotPicked";
}

/** 9–18 digits; an account number can't be a single repeated digit. */
export function validateBankAccount(value: string): ValidationCode | null {
  if (!value) return "accountRequired";
  if (!/^\d+$/.test(value)) return "accountInvalid";
  if (value.length < 9 || value.length > 18) return "accountLength";
  if (/^(\d)\1+$/.test(value)) return "accountInvalid";
  return null;
}

export function validateAccountMatch(account: string, confirm: string): ValidationCode | null {
  return account === confirm ? null : "accountMismatch";
}

/** 4 letters, a zero, then 6 letters or digits. */
export function validateIfsc(value: string): ValidationCode | null {
  const ifsc = value.trim().toUpperCase();
  if (!ifsc) return "ifscRequired";
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc) ? null : "ifscInvalid";
}
