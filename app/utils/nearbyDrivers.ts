import { getNearbyDriversJson } from "@/services/places.service";

/** An online captain's live position, ready to draw on a map. */
export interface NearbyDriverPin {
  id: string;
  lat: number;
  lng: number;
  vehicleType: string;
  heading?: number;
  name: string;
}

interface Options {
  /** Metres. */
  radius: number;
  /** Only captains with this vehicle (the server filters). */
  vehicleType?: string;
  /** Used for a captain whose record carries no vehicle type. */
  fallbackVehicleType?: string;
}

/**
 * The captains online around a point, as map pins. Only a captain's own live
 * position is used: falling back to their saved home address, or to the pickup
 * itself, put captains with no GPS fix on the map -- sometimes exactly on the
 * pickup pin, which reads as a captain already waiting.
 */
export async function fetchNearbyDriverPins(
  latitude: number,
  longitude: number,
  { radius, vehicleType, fallbackVehicleType = "bike" }: Options,
): Promise<NearbyDriverPin[]> {
  const query = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude), radius: String(radius) });
  if (vehicleType) query.set("vehicleType", vehicleType);
  const res = await getNearbyDriversJson<any[]>(query.toString());
  if (!Array.isArray(res)) return [];
  const pins: NearbyDriverPin[] = [];
  for (const drv of res) {
    const coords = drv.currentLocation?.coordinates;
    const lng = Number(coords?.[0]);
    const lat = Number(coords?.[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) continue;
    pins.push({
      id: String(drv._id || drv.id),
      lat,
      lng,
      vehicleType: String(drv.vehicleType || fallbackVehicleType),
      heading: drv.heading,
      name: drv.user?.name || "Driver",
    });
  }
  return pins;
}
