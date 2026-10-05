import { customFetch } from "@/utils/api/custom-fetch";
import { ApiError } from "@/utils/api/http.errors";
import type { PartnerProfile, PartnerRole, PartnerSession } from "@/types/models";

// Sign-in, password reset and password change — the same endpoints and the
// same fallbacks as admin/src/features/vendors/hooks/useVendorLogin.ts.

export interface LoginResponse extends PartnerSession {
  token: string;
}

const credentials = (identifier: string, password: string) => {
  const value = identifier.trim();
  return value.includes("@") ? { email: value.toLowerCase(), password } : { phone: value, password };
};

/**
 * Restaurant login first, then meat centre. A 403 from the restaurant login
 * means the password matched but the application isn't approved yet — that is
 * thrown as-is instead of being masked by a meat-centre login failure.
 */
export async function loginPartner(identifier: string, password: string): Promise<LoginResponse> {
  const body = JSON.stringify(credentials(identifier, password));
  try {
    return await customFetch<LoginResponse>("/vendors/login", { method: "POST", body });
  } catch (vendorError) {
    if (vendorError instanceof ApiError && vendorError.status === 403) throw vendorError;
    return customFetch<LoginResponse>("/meat/login", { method: "POST", body });
  }
}

/**
 * Both endpoints answer the same "if an account exists" message, so both are
 * asked; each emails a code only if the address is one of its accounts.
 */
export async function requestPasswordResetOtp(email: string) {
  const body = JSON.stringify({ email: email.trim().toLowerCase() });
  const [meat, vendor] = await Promise.allSettled([
    customFetch("/meat/forgot-password", { method: "POST", body }),
    customFetch("/vendors/forgot-password", { method: "POST", body }),
  ]);
  if (meat.status === "rejected" && vendor.status === "rejected") throw vendor.reason;
}

/** Meat centre first, then restaurant — whichever account the code was issued for. */
export async function resetPassword(email: string, otp: string, newPassword: string) {
  const body = JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim(), newPassword });
  try {
    await customFetch("/meat/reset-password", { method: "POST", body });
  } catch {
    await customFetch("/vendors/reset-password", { method: "POST", body });
  }
}

export const changePassword = (role: PartnerRole, currentPassword: string, newPassword: string) =>
  customFetch(role === "meat_vendor" ? "/meat/change-password" : "/vendors/change-password", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });

/**
 * Best effort — revokes this token server-side so a leaked copy can't be reused.
 * Sign-out passes the Authorization header itself: the session is already cleared.
 */
export const logoutSession = (headers?: HeadersInit) => customFetch("/auth/logout", { method: "POST", headers });

/** The signed-in outlet's own profile — name, contact, address, rating, open state. */
export const getMyProfile = () => customFetch<PartnerProfile>("/vendors/me");
