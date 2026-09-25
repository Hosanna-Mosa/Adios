

// Module-level values shared by the parts of useRideConfirmation.

export const isValidCoordinate = (coordinate: { latitude: number; longitude: number }) =>
  Number.isFinite(coordinate.latitude) &&
  Number.isFinite(coordinate.longitude) &&
  Math.abs(coordinate.latitude) <= 90 &&
  Math.abs(coordinate.longitude) <= 180 &&
  !(coordinate.latitude === 0 && coordinate.longitude === 0);

import i18n from "@/i18n";

// Only Bike and Auto are enabled anywhere in the app today (All Services
// keeps Cab Economy/Prime commented out — a pre-existing decision, not one
// made during this redesign), so those are the only two tiers this screen
// can honestly compare fares for.
//
// A function rather than a static array so `name`/`capacity` can call t() —
// used from several plain (non-hook) modules alongside components, so it
// reads the shared i18n instance directly instead of threading useTranslation()
// through every consumer. See ADIOS_MULTILINGUAL_DEVELOPMENT_PLAN.md,
// Section 11.
export function getEnabledTiers(): { id: "bike" | "auto"; name: string; icon: string; capacity: string }[] {
  return [
    { id: "bike", name: i18n.t("app.rideTierNames.bike"), icon: "🏍", capacity: i18n.t("app.rideConfirmation.capacity.bike") },
    { id: "auto", name: i18n.t("app.rideTierNames.auto"), icon: "🛺", capacity: i18n.t("app.rideConfirmation.capacity.auto") },
  ];
}

export type FareEstimate = { distanceInKm: number; estimatedMinutes: number; fareBreakdown: { total: number } };

export type RouteOptimizeResponse = { polyline?: string };

export function decodePolyline(encoded: string) {
  const points: Array<{ latitude: number; longitude: number }> = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let shift = 0, result = 0, byte = 0;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20 && index < encoded.length);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20 && index < encoded.length);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}
