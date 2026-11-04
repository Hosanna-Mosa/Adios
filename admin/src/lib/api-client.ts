import i18n from "@/i18n";
import { clearSession, getAccessToken, getRefreshToken, storeRenewedTokens } from "@/lib/session";
import { configureSessionRefresh } from "@/lib/sessionRefresh";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// Renews the short access token silently; only a refresh the server rejects reaches the
// 401 handling in adminFetch below. Every role keeps its token in localStorage, so a
// renewed token is picked up by the next read anywhere in the panel.
configureSessionRefresh({
  apiUrl: BASE_URL,
  getToken: () => getAccessToken()?.token ?? null,
  getRefreshToken,
  onTokens: storeRenewedTokens,
});

/** Best-effort sign-out on the server (revokes the token and its refresh session). Call before clearSession(). */
export function logoutOnServer() {
  const token = getAccessToken()?.token;
  if (!token) return;
  fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ refreshToken: getRefreshToken() }),
  }).catch(() => {});
}

/** A non-2xx response. Still an Error, so existing `.message` handling is unchanged. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function adminFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("admin_token") || localStorage.getItem("vendor_token") || localStorage.getItem("support_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };


  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // A 401 on an authenticated call means the session is gone server-side — the
  // token expired, the admin removed this support member or reset their password.
  // Login and password endpoints answer 401 for a wrong password, so they're left alone.
  if (response.status === 401 && token && !/login|password/.test(endpoint)) {
    clearSession();
    window.location.assign("/vendor-login");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: i18n.t("common.unknownError") }));
    throw new ApiError(error.message || i18n.t("common.requestFailed"), response.status, error);
  }

  return response.json();
}
