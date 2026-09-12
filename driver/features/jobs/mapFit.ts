import type MapView from "react-native-maps";

export type LatLng = { latitude: number; longitude: number };

/**
 * Frames the whole route. The centre is nudged upward so the bottom sheet
 * doesn't cover the destination.
 */
export function fitMapToCoords(
  map: MapView | null,
  coords: LatLng[],
  fallback: { lat: number; lng: number },
  fallbackDelta: number,
  duration: number,
) {
  if (coords.length > 1) {
    const lats = coords.map((c) => c.latitude);
    const lngs = coords.map((c) => c.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const centerLat = (minLat + maxLat) / 2;

    map?.animateToRegion(
      {
        latitude: centerLat - (maxLat - minLat) * 0.15,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max(0.04, (maxLat - minLat) * 2.0),
        longitudeDelta: Math.max(0.04, (maxLng - minLng) * 2.0),
      },
      1000,
    );
    return;
  }

  map?.animateToRegion(
    {
      latitude: fallback.lat,
      longitude: fallback.lng,
      latitudeDelta: fallbackDelta,
      longitudeDelta: fallbackDelta,
    },
    duration,
  );
}

export function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const rad = Math.PI / 180;
  const phi1 = lat1 * rad;
  const phi2 = lat2 * rad;
  const deltaLambda = (lng2 - lng1) * rad;
  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  return (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360;
}

export function stopCoords(stop: any): LatLng | null {
  if (!stop) return null;
  return { latitude: Number(stop.lat), longitude: Number(stop.lng) };
}
