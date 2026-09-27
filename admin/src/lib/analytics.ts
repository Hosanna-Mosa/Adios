import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { Analytics } from "firebase/analytics";

// Firebase Analytics (GA4) for the admin / support / vendor panel. Config comes
// from the VITE_FIREBASE_* env vars (see .env.example); with any of them unset —
// local dev, preview builds — every export here is a silent no-op. The SDK is
// loaded lazily so it stays out of the main bundle.

type Params = Record<string, string | number | boolean | undefined>;
type Role = "admin" | "support" | "vendor";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};
const enabled = Boolean(config.apiKey && config.projectId && config.appId && config.measurementId);

let ready: Promise<{ analytics: Analytics; sdk: typeof import("firebase/analytics") } | null> | null = null;

function load() {
  if (!enabled) return Promise.resolve(null);
  ready ??= (async () => {
    try {
      const [{ initializeApp }, sdk] = await Promise.all([import("firebase/app"), import("firebase/analytics")]);
      if (!(await sdk.isSupported())) return null;
      // Page views are sent by usePageViews below, with IDs stripped from the
      // path, so the automatic one (full raw URL) is turned off.
      const analytics = sdk.initializeAnalytics(initializeApp(config), { config: { send_page_view: false } });
      return { analytics, sdk };
    } catch (err) {
      console.warn("[Analytics] Firebase unavailable:", err);
      return null;
    }
  })();
  return ready;
}

export function trackEvent(name: string, params?: Params) {
  void load().then((fb) => fb?.sdk.logEvent(fb.analytics, name, params));
}

/** Which panel session is active, mirroring RootRedirect's token precedence. */
function currentSession(): { role: Role; userId: string | null } | null {
  const order: Role[] = ["admin", "support", "vendor"];
  for (const role of order) {
    const token = localStorage.getItem(`${role}_token`);
    if (token) return { role, userId: userIdFromJwt(token) };
  }
  return null;
}

function userIdFromJwt(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    const id = payload.userId ?? payload.id;
    return id ? String(id) : null;
  } catch {
    return null;
  }
}

/** Mongo ObjectIds and plain numeric IDs → ":id", so /users/<id> is one page in reports. */
function normalizePath(pathname: string) {
  return pathname.replace(/\/(?:[a-f0-9]{24}|\d+)(?=\/|$)/gi, "/:id");
}

let lastSessionKey: string | null | undefined;

/**
 * Mounted once inside the router: sends a page_view per navigation and keeps
 * the user ID + `panel_role` user property in step with whichever token is
 * stored. Login and logout both navigate, so checking here catches them too.
 */
export function usePageViews() {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = normalizePath(pathname);
    const session = currentSession();
    const sessionKey = session ? `${session.role}:${session.userId}` : null;

    void load().then((fb) => {
      if (!fb) return;
      if (sessionKey !== lastSessionKey) {
        lastSessionKey = sessionKey;
        fb.sdk.setUserId(fb.analytics, session?.userId ?? null);
        fb.sdk.setUserProperties(fb.analytics, { panel_role: session?.role ?? null });
      }
      fb.sdk.logEvent(fb.analytics, "page_view", {
        page_path: path,
        page_location: window.location.origin + path,
        page_title: document.title,
      });
    });
  }, [pathname]);
}
