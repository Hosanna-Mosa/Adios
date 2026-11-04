// One place that knows which panel session is active. Each role keeps its own
// localStorage token (admin_token / support_token / vendor_token); only one is
// ever set at a time — startSession clears the others.
export type PanelRole = "admin" | "support" | "vendor";

const SESSION_KEYS: Record<PanelRole, { token: string; data: string }> = {
  admin: { token: "admin_token", data: "admin_data" },
  support: { token: "support_token", data: "support_data" },
  vendor: { token: "vendor_token", data: "vendor_data" },
};

const REFRESH_KEY = "refresh_token";

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** The staff role (admin or support) signed in to the dashboard, if any. */
export function getStaffRole(): "admin" | "support" | null {
  if (read(SESSION_KEYS.admin.token)) return "admin";
  if (read(SESSION_KEYS.support.token)) return "support";
  return null;
}

/** The access token of whichever role is signed in, with the storage key it lives under. */
export function getAccessToken(): { token: string; key: string } | null {
  for (const { token } of Object.values(SESSION_KEYS)) {
    const value = read(token);
    if (value) return { token: value, key: token };
  }
  return null;
}

export const getRefreshToken = () => read(REFRESH_KEY);

/** Stores a renewed pair under the same role key the old access token was in. */
export function storeRenewedTokens(tokens: { token: string; refreshToken: string }) {
  const current = getAccessToken();
  if (!current) return;
  localStorage.setItem(current.key, tokens.token);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
}

export function getSessionData<T = Record<string, unknown>>(role: PanelRole): T | null {
  const raw = read(SESSION_KEYS[role].data);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearSession() {
  for (const { token, data } of Object.values(SESSION_KEYS)) {
    try {
      localStorage.removeItem(token);
      localStorage.removeItem(data);
    } catch {
      // Storage unavailable — nothing persisted to clear.
    }
  }
  try {
    localStorage.removeItem(REFRESH_KEY);
  } catch {
    // Storage unavailable — nothing persisted to clear.
  }
}

/** Replaces whatever session exists, so a browser never holds two roles' tokens. */
export function startSession(role: PanelRole, token: string, data: unknown, refreshToken?: string) {
  clearSession();
  localStorage.setItem(SESSION_KEYS[role].token, token);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  localStorage.setItem(SESSION_KEYS[role].data, JSON.stringify(data));
}

/** Where a support session lands after sign-in, and when it tries to open an admin-only page. */
export const SUPPORT_HOME = "/support-cases";
