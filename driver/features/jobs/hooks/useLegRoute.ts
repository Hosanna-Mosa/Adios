import { useEffect, useRef, useState } from "react";

import { API_URL } from "@/utils/apiUrl";
import type { LatLng } from "../mapFit";
import { decodePolyline } from "../utils/polyline";

type Point = { lat?: number | string | null; lng?: number | string | null } | null | undefined;

// Re-plan once the driver is this far from where the current line started…
const REROUTE_AFTER_M = 400;
// …but never more often than this, and retry a failed request after RETRY_MS.
const MIN_REROUTE_MS = 20_000;
const RETRY_MS = 10_000;
const REQUEST_TIMEOUT_MS = 10_000;

function toLatLng(p: Point): LatLng | null {
  if (!p || p.lat == null || p.lng == null) return null;
  const latitude = Number(p.lat);
  const longitude = Number(p.lng);
  return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null;
}

function metersBetween(a: LatLng, b: LatLng) {
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLng = (b.longitude - a.longitude) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}

/** Road route between two points from the backend (Google Directions → OSRM → straight line). */
async function fetchRoute(from: LatLng, to: LatLng): Promise<LatLng[] | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_URL}/routing/optimize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: { lat: from.latitude, lng: from.longitude },
        stops: [{ id: "leg-target", lat: to.latitude, lng: to.longitude, type: "drop" }],
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.polyline === "string" && data.polyline ? decodePolyline(data.polyline) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The way from the driver's live position to `target` — the restaurant before
 * pickup, the customer after. Planned when the target changes and re-planned as
 * the driver drives on, so the line keeps starting where the driver actually is.
 * Returns null until a route for the current target exists.
 */
export function useLegRoute(driver: Point, target: Point, enabled: boolean): LatLng[] | null {
  const [route, setRoute] = useState<{ key: string; coords: LatLng[] } | null>(null);
  const planned = useRef<{ key: string; at: LatLng; time: number; failed: boolean } | null>(null);
  const requestSeq = useRef(0);
  // Bumped after a failed request, so a driver standing still (no GPS ticks) still retries.
  const [retryTick, setRetryTick] = useState(0);
  const mounted = useRef(true);
  // Set on (re)mount too: a remount (Fast Refresh, StrictMode) runs the cleanup
  // first, and leaving the flag false would drop every route that comes back.
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const from = toLatLng(driver);
  const to = toLatLng(target);
  const targetKey = to ? `${to.latitude.toFixed(5)},${to.longitude.toFixed(5)}` : "";

  useEffect(() => {
    if (!enabled || !from || !to) return;

    const now = Date.now();
    const last = planned.current;
    if (last && last.key === targetKey) {
      const waited = now - last.time;
      const retry = last.failed && waited >= RETRY_MS;
      const replan = !last.failed && waited >= MIN_REROUTE_MS && metersBetween(last.at, from) >= REROUTE_AFTER_M;
      if (!retry && !replan) return;
    }

    planned.current = { key: targetKey, at: from, time: now, failed: false };
    const seq = ++requestSeq.current;
    fetchRoute(from, to).then((coords) => {
      if (!mounted.current || seq !== requestSeq.current) return;
      if (coords && coords.length > 1) {
        setRoute({ key: targetKey, coords });
      } else if (planned.current) {
        // Keep whatever line is showing; try again shortly.
        planned.current = { ...planned.current, failed: true };
        setTimeout(() => mounted.current && setRetryTick((t) => t + 1), RETRY_MS);
      }
    });
    // Only the coordinates matter; the objects are rebuilt every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, from?.latitude, from?.longitude, targetKey, retryTick]);

  return enabled && route && route.key === targetKey ? route.coords : null;
}
