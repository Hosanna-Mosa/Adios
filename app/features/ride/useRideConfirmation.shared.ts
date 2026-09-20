

// Module-level values shared by the parts of useRideConfirmation.

export const isValidCoordinate = (coordinate: { latitude: number; longitude: number }) =>
  Number.isFinite(coordinate.latitude) &&
  Number.isFinite(coordinate.longitude) &&
  Math.abs(coordinate.latitude) <= 90 &&
  Math.abs(coordinate.longitude) <= 180 &&
  !(coordinate.latitude === 0 && coordinate.longitude === 0);

export // Only Bike and Auto are enabled anywhere in the app today (All Services
// keeps Cab Economy/Prime commented out — a pre-existing decision, not one
// made during this redesign), so those are the only two tiers this screen
// can honestly compare fares for.
const ENABLED_TIERS: { id: "bike" | "auto"; name: string; icon: string; capacity: string }[] = [
  { id: "bike", name: "Bike", icon: "🏍", capacity: "1 seat" },
  { id: "auto", name: "Auto", icon: "🛺", capacity: "3 seats" },
];

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
