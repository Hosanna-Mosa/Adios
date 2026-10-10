import { ApiError } from "@/utils/api/custom-fetch";
import type { HelperQuote } from "@/services/orders.service";

// Module-level values shared by the parts of useHelperTask.

/**
 * compose: what and where. offer: the customer sets the fixed price the task is
 * offered at (one helper at a time — nobody bids). searching / assigned follow the
 * server's status for the order.
 */
export type Step = "compose" | "offer" | "searching" | "assigned";

/** Statuses a helper order can have before anyone takes it. */
export const SEARCHING_STATUSES = ["SEARCHING_DRIVER", "searching_driver", "CREATED", "created"];

/** A helper has taken the task, in both casings the API uses. */
export const ASSIGNED_STATUSES = ["DRIVER_ASSIGNED", "driver_assigned"];

/** The helper has begun the work (start OTP accepted). */
export const STARTED_STATUSES = ["IN_PROGRESS", "in_progress"];

/** The task is finished. */
export const DONE_STATUSES = ["DELIVERED", "delivered", "COMPLETED", "completed"];

/** The task ended before anyone started it. */
export const DEAD_STATUSES = ["CANCELLED", "cancelled"];

/** How long the quote waits after the last change to the pickup, drop-off or hours. */
export const QUOTE_DEBOUNCE_MS = 400;

/** Socket payloads for the helper screen are only ever applied to the order on screen. */
export const isForOrder = (data: any, orderId: string | null | undefined) =>
  !!orderId && data?.orderId != null && String(data.orderId) === String(orderId);

/** The server's own message for a failed call ({ success: false, message, code? }), if it sent one. */
export function apiErrorMessage(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  const message = (error.data as { message?: unknown } | null)?.message;
  return typeof message === "string" && message.trim() ? message : null;
}

/** The stable `code` the server attaches to some errors (TOPUP_REQUIRED, TOPUP_REFUNDED…). */
export function apiErrorCode(error: unknown): string | undefined {
  if (!(error instanceof ApiError)) return undefined;
  return (error.data as { code?: string } | null)?.code;
}

/** An offer kept inside the range the server accepts for this quote. */
export function clampOffer(value: number, quote: HelperQuote | null): number {
  if (!quote) return value;
  return Math.min(quote.maxOffer, Math.max(quote.minOffer, value));
}

/** The order's current price: customerPrice for helper tasks, totalPrice as the fallback. */
export const orderPrice = (order: any): number | null => order?.customerPrice || order?.totalPrice || null;

/** One shape for the helper, whether it came from GET /orders/:id (populated) or `order_accepted`. */
export function toHelperDriver(driver: any) {
  if (!driver || typeof driver !== "object") return null;
  return {
    ...driver,
    id: driver.id ?? driver._id,
    name: driver.name || driver.user?.name || "",
    phone: driver.phone || driver.user?.phone || "",
    vehicle: driver.vehicle || driver.vehicleType || "",
  };
}

/** A stop's coordinates, from the GeoJSON point the API stores (or plain lat/lng). */
export function stopCoords(stop: any): { lat: number; lng: number } | null {
  const lng = Number(stop?.location?.coordinates?.[0] ?? stop?.lng);
  const lat = Number(stop?.location?.coordinates?.[1] ?? stop?.lat);
  return Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0) ? { lat, lng } : null;
}

/** The booked hours as the compose form's duration controls. */
export function durationFromHours(hours: number) {
  if (hours === 1) return { mode: "1hr" as const, hours: 1, minutes: 0 };
  if (hours === 2) return { mode: "2hr" as const, hours: 2, minutes: 0 };
  const whole = Math.floor(hours);
  const minutes = Math.round(((hours - whole) * 60) / 15) * 15;
  return minutes === 60
    ? { mode: "custom" as const, hours: whole + 1, minutes: 0 }
    : { mode: "custom" as const, hours: whole, minutes };
}
