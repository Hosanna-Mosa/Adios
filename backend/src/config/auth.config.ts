import { UserRole } from "../database/models/User";

/**
 * Roles a caller may obtain through the public OTP endpoint.
 *
 * OTP verification is a stub that accepts any code (see AuthService.verifyOTP),
 * so every role reachable here is a role anyone on the internet can mint for
 * themselves. Only the two self-service app roles belong in this list.
 */
export const SELF_SIGNUP_ROLES: readonly UserRole[] = [UserRole.USER, UserRole.DRIVER];

export const isSelfSignupRole = (role: UserRole): boolean => SELF_SIGNUP_ROLES.includes(role);

/**
 * The one phone number allowed to hold the ADMIN role. The account is
 * provisioned out of band by `src/scripts/seed-admin.ts` and signs in with a
 * password — there is no code path that creates a second admin.
 */
export const ADMIN_PHONE = "9999999999";

/** Reduces +91 / 91 / 0 prefixed forms to the bare 10-digit national number. */
export const normalizeIndianPhone = (phone: string): string => {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
};

export const isAdminPhone = (phone: string): boolean => normalizeIndianPhone(phone) === ADMIN_PHONE;

/**
 * One message for both OTP rejections — a role that is not self-service, and an
 * existing privileged account. Saying which one applies would confirm that a
 * given phone number belongs to an admin or support agent.
 */
export const OTP_ROLE_NOT_ALLOWED_MESSAGE =
  "OTP sign-in is only available for customer and driver accounts";

/**
 * Shown when a blocked account tries to sign in or use an existing session.
 * Safe to be specific: on the password path it is only reachable after the
 * credentials have already matched, so it tells the account holder something
 * they need to know without revealing anything to anyone else.
 */
export const ACCOUNT_BLOCKED_MESSAGE =
  "This account has been blocked. Please contact support.";
