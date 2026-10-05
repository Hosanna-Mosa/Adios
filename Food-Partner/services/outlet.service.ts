import { customFetch } from "@/utils/api/custom-fetch";
import type { PartnerProfile } from "@/types/models";

// The signed-in outlet's own switches — backend/src/modules/vendors/vendor-profile.controller.ts.

/**
 * The "Accepting orders" switch. Opening hours still apply on top of it, so the
 * answer — the fresh profile — carries the resulting open state.
 */
export const setOutletOpen = (isOpen: boolean) =>
  customFetch<PartnerProfile>("/vendors/me/open", { method: "PUT", body: JSON.stringify({ isOpen }) });

/** Registers this device for the outlet's order alerts. */
export const registerPushToken = (expoPushToken: string) =>
  customFetch("/vendors/me/push-token", { method: "POST", body: JSON.stringify({ expoPushToken }) });

/**
 * Stops this device getting the outlet's alerts. Sign-out passes the session's
 * Authorization header explicitly, because the token is cleared before this
 * request goes out.
 */
export const removePushToken = (expoPushToken: string, headers?: HeadersInit) =>
  customFetch("/vendors/me/push-token", { method: "DELETE", body: JSON.stringify({ expoPushToken }), headers });
