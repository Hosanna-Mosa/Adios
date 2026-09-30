// One place that knows which panel session is active. Each role keeps its own
// localStorage token (admin_token / support_token / vendor_token); only one is
// ever set at a time — startSession clears the others.
export type PanelRole = "admin" | "support" | "vendor";

const SESSION_KEYS: Record<PanelRole, { token: string; data: string }> = {
  admin: { token: "admin_token", data: "admin_data" },
  support: { token: "support_token", data: "support_data" },
  vendor: { token: "vendor_token", data: "vendor_data" },
};

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
}

/** Replaces whatever session exists, so a browser never holds two roles' tokens. */
export function startSession(role: PanelRole, token: string, data: unknown) {
  clearSession();
  localStorage.setItem(SESSION_KEYS[role].token, token);
  localStorage.setItem(SESSION_KEYS[role].data, JSON.stringify(data));
}

/** Where a support session lands after sign-in, and when it tries to open an admin-only page. */
export const SUPPORT_HOME = "/support-cases";
