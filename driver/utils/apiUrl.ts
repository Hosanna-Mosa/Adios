import Constants from "expo-constants";

/**
 * Single source of truth for where this app talks to the backend.
 *
 * Nineteen files used to resolve `EXPO_PUBLIC_API_URL` themselves, each with a
 * different fallback, so a wrong or stale value failed differently everywhere.
 * The normalising below exists because of two real failures seen in the field:
 *
 *  - `.env` values written with surrounding quotes, which some bundler/cache
 *    paths pass through verbatim, producing a URL that can never resolve.
 *  - Builds made before `eas.json` gained the `/api/v1` suffix, which sent
 *    every request one level too high and got a 404 back.
 *
 * Every backend route in this repo is mounted under `/api/v1`, so appending it
 * when it is missing is a correction, never a guess.
 */
function normalise(raw: string | undefined | null): string {
  if (!raw) return "";

  let url = String(raw).trim();

  // strip a matched pair of surrounding quotes
  if (
    (url.startsWith('"') && url.endsWith('"')) ||
    (url.startsWith("'") && url.endsWith("'"))
  ) {
    url = url.slice(1, -1).trim();
  }

  url = url.replace(/\/+$/, "");
  if (!url) return "";

  if (!/\/api\/v\d+$/.test(url)) {
    url = `${url}/api/v1`;
  }

  return url;
}

const configured =
  process.env.EXPO_PUBLIC_API_URL || (Constants.expoConfig?.extra as any)?.apiUrl;

/** Base for REST calls — always ends in `/api/v1`, never in a slash. */
export const API_URL = normalise(configured) || "http://localhost:3000/api/v1";

/** Server origin for Socket.IO, which connects to the host, not the API path. */
export const SOCKET_ORIGIN = API_URL.split("/api")[0] || API_URL;

if (__DEV__ && !configured) {
  console.warn(
    "[api] EXPO_PUBLIC_API_URL is not set — falling back to " + API_URL +
      ". Create driver/.env from .env.example and restart with `expo start --clear`.",
  );
}
