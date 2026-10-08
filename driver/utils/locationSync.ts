import { useDriverStore } from "@/store/driverStore";
import { API_URL } from "./apiUrl";

/** Default gap between location PATCHes. */
export const LOCATION_MIN_INTERVAL_MS = 4000;
/** Active order / simulator may report a little faster. */
export const LOCATION_FAST_INTERVAL_MS = 3000;
/** Stationary drivers still ping this often (dispatch drops drivers silent for 10 min). */
export const LOCATION_HEARTBEAT_MS = 60 * 1000;
const MOVED_METERS = 25;

let inFlight = false;
let lastSentAt = 0;
let lastSent: { lat: number; lng: number } | null = null;

function metersBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function msSinceLastLocationSync() {
  return lastSentAt ? Date.now() - lastSentAt : Infinity;
}

/** The one place the driver's position reaches the server (PATCH /drivers/location).
 * Throttled: never overlapping, at most once per `minIntervalMs` unless the
 * driver moved more than 25 m since the last report. No-op while offline. */
export async function syncDriverLocation(
  lat: number,
  lng: number,
  heading?: number | null,
  options?: { minIntervalMs?: number },
): Promise<void> {
  const { isOnline, token } = useDriverStore.getState();
  if (!isOnline || !token || inFlight) return;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

  const minInterval = options?.minIntervalMs ?? LOCATION_MIN_INTERVAL_MS;
  const moved = !!lastSent && metersBetween(lastSent, { lat, lng }) > MOVED_METERS;
  if (!moved && msSinceLastLocationSync() < minInterval) return;

  inFlight = true;
  // Attempt time, so a failing network is retried at the normal pace, not on every fix.
  lastSentAt = Date.now();
  try {
    const body: Record<string, number> = { latitude: lat, longitude: lng };
    if (typeof heading === "number" && heading >= 0 && !isNaN(heading)) body.heading = heading;
    const res = await fetch(`${API_URL}/drivers/location`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (res.ok) lastSent = { lat, lng };
  } catch (e) {
    console.warn("[LocationSync] Location update failed:", e);
  } finally {
    inFlight = false;
  }
}
