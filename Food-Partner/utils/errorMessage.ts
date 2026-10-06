import { ApiError } from "@/utils/api/http.errors";

/**
 * The sentence to show a partner for a failed call. customFetch's ApiError
 * message is built for logs ("HTTP 401 Unauthorized: …"); the backend's own
 * `message` field is what belongs on screen.
 */
export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const data = error.data as { message?: unknown } | null;
    if (data && typeof data.message === "string" && data.message.trim()) return data.message;
    return fallback;
  }
  if (error instanceof Error && error.message && !error.message.startsWith("HTTP ")) {
    // Network failures surface as TypeError("Network request failed").
    return error.message === "Network request failed" ? fallback : error.message;
  }
  return fallback;
}

/** The backend's error body, when there is one — e.g. to read a `code` field. */
export function errorBody(error: unknown): Record<string, unknown> {
  if (error instanceof ApiError && error.data && typeof error.data === "object") {
    return error.data as Record<string, unknown>;
  }
  return {};
}

export function errorStatus(error: unknown): number | undefined {
  return error instanceof ApiError ? error.status : undefined;
}
