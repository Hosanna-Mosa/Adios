import { ApiError } from "./http.errors";
import { looksLikeJson, parseErrorBody, parseSuccessBody } from "./http.body";

export type CustomFetchOptions = RequestInit & {
  responseType?: "json" | "text" | "blob" | "auto";
  isFormData?: boolean;
};

export { ApiError, ResponseParseError } from "./http.errors";

export type ErrorType<T = unknown> = ApiError<T>;

export type BodyType<T> = T;

export type AuthTokenGetter = () => Promise<string | null> | string | null;

export type UnauthorizedHandler = (response: Response) => void;

const DEFAULT_JSON_ACCEPT = "application/json, application/problem+json";

// React Native's fetch never gives up on its own, so on a crawling connection
// a screen would sit on its loader indefinitely. Photo uploads get longer.
const REQUEST_TIMEOUT_MS = 20000;
const UPLOAD_TIMEOUT_MS = 60000;

// ---------------------------------------------------------------------------
// Module-level configuration
// ---------------------------------------------------------------------------

let _baseUrl: string | null = null;
let _authTokenGetter: AuthTokenGetter | null = null;
let _unauthorizedHandler: UnauthorizedHandler | null = null;

/**
 * Set a base URL that is prepended to every relative request URL
 * (i.e. paths that start with `/`).
 *
 * Useful for Expo bundles that need to call a remote API server.
 * Pass `null` to clear the base URL.
 */
export function setBaseUrl(url: string | null): void {
  _baseUrl = url ? url.replace(/\/+$/, "") : null;
}

/**
 * Register a getter that supplies a bearer auth token.  Before every fetch
 * the getter is invoked; when it returns a non-null string, an
 * `Authorization: Bearer <token>` header is attached to the request.
 *
 * Useful for Expo bundles making token-gated API calls.
 * Pass `null` to clear the getter.
 */
export function setAuthTokenGetter(getter: AuthTokenGetter | null): void {
  _authTokenGetter = getter;
}

/**
 * Register a handler invoked whenever the API answers 401 — the single status
 * the backend uses for a missing, expired or revoked token. It runs before the
 * `ApiError` is thrown, so per-call catch blocks keep working unchanged.
 *
 * The handler is called once per 401 response, so it must be idempotent: a
 * screen firing several requests at once produces several 401s, and only the
 * first may clear the session and navigate.
 * Pass `null` to clear the handler.
 */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  _unauthorizedHandler = handler;
}

function isRequest(input: RequestInfo | URL): input is Request {
  return typeof Request !== "undefined" && input instanceof Request;
}

function resolveMethod(input: RequestInfo | URL, explicitMethod?: string): string {
  if (explicitMethod) return explicitMethod.toUpperCase();
  if (isRequest(input)) return input.method.toUpperCase();
  return "GET";
}

// Use loose check for URL — some runtimes (e.g. React Native) polyfill URL
// differently, so `instanceof URL` can fail.
function isUrl(input: RequestInfo | URL): input is URL {
  return typeof URL !== "undefined" && input instanceof URL;
}

function applyBaseUrl(input: RequestInfo | URL): RequestInfo | URL {
  if (!_baseUrl) return input;
  const url = resolveUrl(input);
  // Only prepend to relative paths (starting with /)
  if (!url.startsWith("/")) return input;

  const absolute = `${_baseUrl}${url}`;
  if (typeof input === "string") return absolute;
  if (isUrl(input)) return new URL(absolute);
  return new Request(absolute, input as Request);
}

function resolveUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (isUrl(input)) return input.toString();
  return input.url;
}

function mergeHeaders(...sources: (HeadersInit | undefined)[]): Headers {
  const headers = new Headers();

  for (const source of sources) {
    if (!source) continue;
    new Headers(source).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
}

export async function customFetch<T = unknown>(
  input: RequestInfo | URL,
  options: CustomFetchOptions = {},
): Promise<T> {
  input = applyBaseUrl(input);
  const { responseType = "auto", headers: headersInit, ...init } = options;

  const method = resolveMethod(input, init.method);

  if (init.body != null && (method === "GET" || method === "HEAD")) {
    throw new TypeError(`customFetch: ${method} requests cannot have a body.`);
  }

  const headers = mergeHeaders(isRequest(input) ? input.headers : undefined, headersInit);

  if (
    !options.isFormData &&
    typeof init.body === "string" &&
    !headers.has("content-type") &&
    looksLikeJson(init.body)
  ) {
    headers.set("content-type", "application/json");
  }

  if (responseType === "json" && !headers.has("accept")) {
    headers.set("accept", DEFAULT_JSON_ACCEPT);
  }

  // Attach bearer token when an auth getter is configured and no
  // Authorization header has been explicitly provided.
  if (_authTokenGetter && !headers.has("authorization")) {
    const token = await _authTokenGetter();
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
  }

  const requestInfo = { method, url: resolveUrl(input) };

  // Our own controller, so a caller's signal still cancels the request too.
  const controller = new AbortController();
  const callerSignal = init.signal;
  const onCallerAbort = () => controller.abort();
  if (callerSignal?.aborted) controller.abort();
  else callerSignal?.addEventListener("abort", onCallerAbort);
  let timedOut = false;
  const timer = setTimeout(
    () => {
      timedOut = true;
      controller.abort();
    },
    options.isFormData ? UPLOAD_TIMEOUT_MS : REQUEST_TIMEOUT_MS,
  );

  try {
    // Development only: a release build must not write every URL (ids included) to the device log.
    if (__DEV__) console.log(`[NETWORK] ${method} ${input}`);
    const response = await fetch(input, { ...init, method, headers, signal: controller.signal });
    if (__DEV__) console.log(`[NETWORK] ${response.status} ${response.statusText} from ${input}`);

    if (!response.ok) {
      if (response.status === 401 && _unauthorizedHandler) {
        _unauthorizedHandler(response);
      }
      const errorData = await parseErrorBody(response, method);
      throw new ApiError(response, errorData, requestInfo);
    }

    return (await parseSuccessBody(response, responseType, requestInfo)) as T;
  } catch (error) {
    // Reported exactly like a dropped connection, so every screen's existing
    // "check your connection" handling (and errorMessage's fallback) applies.
    if (timedOut) throw new TypeError("Network request failed");
    throw error;
  } finally {
    clearTimeout(timer);
    callerSignal?.removeEventListener("abort", onCallerAbort);
  }
}
