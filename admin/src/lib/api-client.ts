import i18n from "@/i18n";
import { clearSession } from "@/lib/session";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

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
