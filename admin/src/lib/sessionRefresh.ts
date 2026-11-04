/**
 * Silent sign-in renewal. The API now hands out a short access token plus a one-use refresh
 * token. This wraps the global `fetch` so that any call to the API that comes back 401 trades
 * the refresh token for a new pair once, then repeats the call. customFetch and the raw
 * `fetch(`${apiUrl}/...`)` calls all go through it without changes.
 *
 * Only a 401 from /auth/refresh itself means the session is really over; a timeout, a 5xx or
 * "refresh already in progress" (409) never signs anyone out.
 */

export const AUTH_REFRESH_HEADER = { "x-auth-refresh": "1" } as const;

export interface SessionRefreshConfig {
  apiUrl: string;
  getToken: () => string | null;
  getRefreshToken: () => string | null;
  /** Persist the new pair (memory + storage). */
  onTokens: (tokens: { token: string; refreshToken: string }) => void | Promise<void>;
}

let config: SessionRefreshConfig | null = null;
let inFlight: Promise<string | null> | null = null;
const realFetch: typeof fetch = globalThis.fetch.bind(globalThis);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Returns the new access token, or null when the session is over. Throws on a transient failure. */
async function runRefresh(cfg: SessionRefreshConfig): Promise<string | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const refreshToken = cfg.getRefreshToken();
    if (!refreshToken) return null;

    const response = await realFetch(`${cfg.apiUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      if (!data?.token || !data?.refreshToken) throw new Error("Malformed refresh response");
      await cfg.onTokens({ token: data.token, refreshToken: data.refreshToken });
      return data.token as string;
    }
    if (response.status === 401) return null;
    // 409: another refresh just rotated the token; pick up the stored new one and try again.
    if (response.status === 409) {
      await sleep(1500);
      continue;
    }
    throw new Error(`Refresh failed (${response.status})`);
  }
  throw new Error("Refresh still in progress");
}

/** One refresh at a time, however many requests hit 401 together. */
export function refreshSessionOnce(): Promise<string | null> {
  if (!config) return Promise.resolve(null);
  if (!inFlight) {
    inFlight = runRefresh(config).finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

const urlOf = (input: RequestInfo | URL): string =>
  typeof input === "string" ? input : input instanceof URL ? input.toString() : (input as Request).url;

/** Call once at start-up (and again is harmless). */
export function configureSessionRefresh(cfg: SessionRefreshConfig): void {
  config = cfg;
  if ((globalThis.fetch as any).__authRefreshWrapped) return;

  const wrapped = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const response = await realFetch(input, init);
    const cfg = config;
    if (!cfg || response.status !== 401) return response;

    const url = urlOf(input);
    // Only the API's own authenticated calls; never the sign-in / refresh / sign-out endpoints.
    if (!url.startsWith(cfg.apiUrl) || url.startsWith(`${cfg.apiUrl}/auth/`)) return response;
    if (typeof input !== "string" && !(input instanceof URL)) return response;

    const headers = new Headers(init?.headers);
    const sent = headers.get("authorization");
    if (!sent || !cfg.getRefreshToken()) return response;

    // The token that failed may already have been replaced by a refresh that finished meanwhile.
    const current = cfg.getToken();
    let fresh: string | null;
    if (current && sent !== `Bearer ${current}`) fresh = current;
    else fresh = await refreshSessionOnce(); // throws on transient failure, so callers see a network error, not a sign-out
    if (!fresh) return response;

    headers.set("authorization", `Bearer ${fresh}`);
    return realFetch(input, { ...init, headers });
  };
  (wrapped as any).__authRefreshWrapped = true;
  globalThis.fetch = wrapped as typeof fetch;
}
