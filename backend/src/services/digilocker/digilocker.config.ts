import { DigiLockerMode } from "./digilocker.types";

/**
 * DigiLocker configuration, resolved once from the environment.
 *
 * Mode selection (DIGILOCKER_MODE):
 *   live    — talk to the real DigiLocker Partner API. Requires real credentials.
 *   sandbox — talk to the in-process simulator, served over real HTTP from this
 *             backend at /api/v1/digilocker/sandbox/*. No credentials needed.
 *
 * When DIGILOCKER_MODE is unset we infer it: placeholder/empty credentials mean
 * sandbox, so a stock `.env` never accidentally points at production.
 */

const PLACEHOLDER_MARKERS = ["your_", "placeholder", "changeme", "xxxx", "<", "todo"];

function isPlaceholder(raw: string | undefined): boolean {
  if (!raw) return true;
  const value = raw.trim().replace(/^["']|["']$/g, "").toLowerCase();
  if (!value) return true;
  return PLACEHOLDER_MARKERS.some((marker) => value.includes(marker));
}

/** Read an env var, stripping the surrounding quotes some .env files carry. */
function env(name: string, fallback = ""): string {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const cleaned = raw.trim().replace(/^["']|["']$/g, "");
  return cleaned || fallback;
}

function envNumber(name: string, fallback: number): number {
  const parsed = Number(env(name));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const clientId = env("DIGILOCKER_CLIENT_ID");
const clientSecret = env("DIGILOCKER_CLIENT_SECRET");
const credentialsUsable = !isPlaceholder(clientId) && !isPlaceholder(clientSecret);

function resolveMode(): DigiLockerMode {
  const explicit = env("DIGILOCKER_MODE").toLowerCase();

  if (explicit === "live" || explicit === "production") {
    if (!credentialsUsable) {
      // Fail loudly rather than silently serving simulated KYC as if it were real.
      throw new Error(
        "DIGILOCKER_MODE=live requires real DIGILOCKER_CLIENT_ID and DIGILOCKER_CLIENT_SECRET values. " +
          "Set them in the environment, or use DIGILOCKER_MODE=sandbox."
      );
    }
    return "live";
  }

  if (explicit === "sandbox" || explicit === "test" || explicit === "mock") return "sandbox";

  return credentialsUsable ? "live" : "sandbox";
}

const mode = resolveMode();

/** Public origin of this backend — used to build sandbox + callback URLs. */
const publicBaseUrl = env("PUBLIC_BASE_URL", `http://localhost:${env("PORT", "5000")}`).replace(/\/+$/, "");

export const digilockerConfig = {
  mode,
  isSandbox: mode === "sandbox",
  isLive: mode === "live",

  clientId: credentialsUsable ? clientId : "sandbox-client-id",
  clientSecret: credentialsUsable ? clientSecret : "sandbox-client-secret",

  /**
   * DigiLocker OAuth2 base. Defaults to the MeriPehchaan partner host, which is
   * what current DigiLocker partner onboarding issues credentials for.
   */
  baseUrl: env("DIGILOCKER_BASE_URL", "https://digilocker.meripehchaan.gov.in/public/oauth2/1").replace(/\/+$/, ""),

  /** Where DigiLocker sends the browser after the user accepts/denies. */
  redirectUri: env("DIGILOCKER_REDIRECT_URI", `${publicBaseUrl}/api/v1/digilocker/callback`),

  publicBaseUrl,

  /** Sandbox authorize endpoint, served by this backend. */
  sandboxAuthorizeUrl: `${publicBaseUrl}/api/v1/digilocker/sandbox/authorize`,

  /** Minutes a pending (unconsented) session stays valid. */
  sessionTtlMinutes: envNumber("DIGILOCKER_SESSION_TTL_MINUTES", 15),

  /** Seconds a sandbox authorization code stays redeemable. */
  authCodeTtlSeconds: envNumber("DIGILOCKER_AUTH_CODE_TTL_SECONDS", 120),

  /** Refresh the access token when it has less than this many seconds left. */
  tokenRefreshLeewaySeconds: envNumber("DIGILOCKER_TOKEN_REFRESH_LEEWAY_SECONDS", 120),

  /** Outbound HTTP timeout for DigiLocker calls, in milliseconds. */
  requestTimeoutMs: envNumber("DIGILOCKER_REQUEST_TIMEOUT_MS", 20000),

  /** Deep link the callback bounces mobile clients back to after consent. */
  clientRedirectUrl: env("DIGILOCKER_CLIENT_REDIRECT_URL", ""),

  /** Rate limit: max DigiLocker API calls per user per window. */
  rateLimitMax: envNumber("DIGILOCKER_RATE_LIMIT_MAX", 30),
  rateLimitWindowMs: envNumber("DIGILOCKER_RATE_LIMIT_WINDOW_MS", 60_000),

  /** Consent-flow starts are far more expensive; limit them separately. */
  sessionRateLimitMax: envNumber("DIGILOCKER_SESSION_RATE_LIMIT_MAX", 5),
  sessionRateLimitWindowMs: envNumber("DIGILOCKER_SESSION_RATE_LIMIT_WINDOW_MS", 300_000),
} as const;

/** True when the integration has everything it needs to serve requests. */
export function isDigilockerConfigured(): boolean {
  return digilockerConfig.isSandbox || credentialsUsable;
}

export function logDigilockerConfig(): void {
  if (digilockerConfig.isSandbox) {
    console.log(
      `[DIGILOCKER] Running in SANDBOX mode — simulated documents only. ` +
        `Consent screen: ${digilockerConfig.sandboxAuthorizeUrl}`
    );
    return;
  }
  console.log(`[DIGILOCKER] Running in LIVE mode against ${digilockerConfig.baseUrl}`);
}
