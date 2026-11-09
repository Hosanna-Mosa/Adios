import { API_URL } from "./apiUrl";

type FetchArgs = Parameters<typeof fetch>;

type GlobalWithLogger = typeof globalThis & {
  __driverApiLoggerInstalled?: boolean;
  __driverOriginalFetch?: typeof fetch;
};

const getRequestUrl = (input: FetchArgs[0]) => {
  if (typeof input === "string") return input;

  if (input && typeof input === "object" && "url" in input) {
    return String((input as { url?: unknown }).url || "unknown-url");
  }

  return String(input);
};

const getRequestMethod = (input: FetchArgs[0], init?: FetchArgs[1]) => {
  if (init?.method) return init.method.toUpperCase();

  if (input && typeof input === "object" && "method" in input) {
    const method = (input as { method?: unknown }).method;
    if (typeof method === "string" && method.length > 0) {
      return method.toUpperCase();
    }
  }

  return "GET";
};

// React Native's fetch never gives up on its own, so on a crawling connection a
// screen would sit on its loader indefinitely. Uploads (FormData bodies) get longer.
const REQUEST_TIMEOUT_MS = 20000;
const UPLOAD_TIMEOUT_MS = 60000;

const installNetworkLogger = () => {
  const globalWithLogger = globalThis as GlobalWithLogger;

  if (globalWithLogger.__driverApiLoggerInstalled) return;

  globalWithLogger.__driverApiLoggerInstalled = true;
  globalWithLogger.__driverOriginalFetch = globalWithLogger.fetch;
  const originalFetch = globalWithLogger.__driverOriginalFetch;

  // Development only: a release build must not write every URL (ids included) to the device log.
  if (__DEV__) console.log(`[Driver API] Base URL: ${API_URL || "not configured"}`);

  globalWithLogger.fetch = (async (...args: FetchArgs) => {
    const [input, init] = args;
    const url = getRequestUrl(input);
    const method = getRequestMethod(input, init);

    // Our own controller, so a caller's signal still cancels the request too.
    const controller = new AbortController();
    const callerSignal = init?.signal ?? (input instanceof Request ? input.signal : undefined);
    const onCallerAbort = () => controller.abort();
    if (callerSignal?.aborted) controller.abort();
    else callerSignal?.addEventListener("abort", onCallerAbort);
    let timedOut = false;
    const timer = setTimeout(
      () => {
        timedOut = true;
        controller.abort();
      },
      init?.body instanceof FormData ? UPLOAD_TIMEOUT_MS : REQUEST_TIMEOUT_MS,
    );

    if (__DEV__) console.log(`[Driver API] ${method} ${url}`);

    try {
      const response = await originalFetch(input, { ...init, signal: controller.signal });
      if (__DEV__) console.log(`[Driver API] ${method} ${url} -> ${response.status}`);
      return response;
    } catch (error) {
      if (__DEV__) console.warn(`[Driver API] ${method} ${url} failed`, error);
      // Reported exactly like a dropped connection, so every screen's existing
      // "check your connection" handling applies.
      if (timedOut) throw new TypeError("Network request failed");
      throw error;
    } finally {
      clearTimeout(timer);
      callerSignal?.removeEventListener("abort", onCallerAbort);
    }
  }) as typeof fetch;
};

installNetworkLogger();
