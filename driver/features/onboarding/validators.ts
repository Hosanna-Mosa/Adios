import {
  validateAadhaar,
  validateEmail,
  validateLicenseNumber,
  validatePan,
} from "@/utils/validation";

// Boolean forms of the shared field rules in utils/validation.ts (which also say *why* a value is
// wrong). Kept under their old names for the callers that only need pass / fail.
export const validateEmailFormat = (email: string) => validateEmail(email) === null;

export const validateAadhaarFormat = (num: string) => validateAadhaar(num) === null;

export const validatePANFormat = (pan: string) => validatePan(pan) === null;

// Indian DL: 2 letters (state) + 2 digits (RTO) + 4 digits (year) + 7 digits (serial)
export const validateDLFormat = (dl: string): boolean => validateLicenseNumber(dl) === null;
