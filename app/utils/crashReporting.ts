import { flushAnalytics, trackEvent } from "./analytics";

// There is no crash-reporting SDK in this app, so before this a crash on a customer's
// phone left no trace anywhere. Errors now go through the same pipeline as every other
// event ("app_error": Firebase Analytics plus our own backend, visible on the admin
// Live Activity page). It records *that* and *where* — the message and the first
// stack frames — not a full symbolicated report.
//
// Nothing here ever throws: reporting an error must not become a second error.

const REPEAT_WINDOW_MS = 30_000;
const recent = new Set<string>();

export type ErrorKind = "render" | "js";

export function reportError(kind: ErrorKind, error: unknown, fatal = false) {
  try {
    const err = error instanceof Error ? error : new Error(String(error));
    // A render loop can throw the same error on every frame; one report is enough.
    const key = `${kind}:${err.message}`;
    if (recent.has(key)) return;
    recent.add(key);
    setTimeout(() => recent.delete(key), REPEAT_WINDOW_MS);

    trackEvent("app_error", {
      kind,
      fatal,
      message: err.message.slice(0, 200),
      // Event properties are capped at 200 characters each.
      stack: (err.stack || "").split("\n").slice(0, 4).join(" | ").slice(0, 200),
    });
    // A fatal error may take the process with it before the next scheduled upload.
    if (fatal) void flushAnalytics();
  } catch {
    /* ignore */
  }
}

let installed = false;

/** Reports uncaught JavaScript errors, then lets the previous handler (the red box / crash) run as before. */
export function installCrashReporting() {
  if (installed) return;
  installed = true;
  try {
    const errorUtils = (globalThis as any).ErrorUtils;
    if (!errorUtils?.setGlobalHandler) return;
    const previous = errorUtils.getGlobalHandler?.();
    errorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
      reportError("js", error, !!isFatal);
      previous?.(error, isFatal);
    });
  } catch {
    /* ignore */
  }
}
