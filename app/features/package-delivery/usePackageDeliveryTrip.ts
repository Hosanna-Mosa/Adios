import { useEffect, useState } from "react";
import type { PackageDeliveryPoint, PackageDeliveryVehicle } from "@/contexts/packageDeliveryStore";
import { estimateFare } from "@/services/orders.service";
import { getNearbyDriversJson, optimizeRoute } from "@/services/places.service";
import { decodePolyline } from "@/components/mapBackground.utils";
import { PACKAGE_DELIVERY_VEHICLES, distanceKm } from "./packageDelivery.utils";

// What the confirm step shows about the trip: a fare per vehicle, the road route, and
// the captains online around the pickup (refreshed while the screen is open).

export interface FareEstimate {
  distanceInKm: number;
  estimatedMinutes: number;
  fareBreakdown: { total: number };
}

export interface NearbyDriver {
  id: string;
  vehicleType: string;
  lat: number;
  lng: number;
  heading?: number;
}

const DRIVER_REFRESH_MS = 12000;
/** City riding speed for "N min away" — the same rough figure the food dispatcher plans with. */
const PLANNING_SPEED_KMH = 20;

const isAuto = (vehicleType: string) => /auto|rickshaw/i.test(vehicleType);
export const driverMatches = (driver: NearbyDriver, vehicle: PackageDeliveryVehicle) => isAuto(driver.vehicleType) === (vehicle === "auto");

export function usePackageDeliveryTrip(pickup: PackageDeliveryPoint | null, drop: PackageDeliveryPoint | null) {
  const [fares, setFares] = useState<Partial<Record<PackageDeliveryVehicle, FareEstimate | null>>>({});
  const [loadingFares, setLoadingFares] = useState(false);
  const [route, setRoute] = useState<{ latitude: number; longitude: number }[]>([]);
  const [drivers, setDrivers] = useState<NearbyDriver[]>([]);

  const key = pickup && drop ? `${pickup.lat},${pickup.lng}>${drop.lat},${drop.lng}` : "";

  useEffect(() => {
    if (!pickup || !drop) return;
    let cancelled = false;
    setLoadingFares(true);
    Promise.all(PACKAGE_DELIVERY_VEHICLES.map(async ({ id }) => {
      const query = new URLSearchParams({
        pickupLat: String(pickup.lat), pickupLng: String(pickup.lng),
        dropLat: String(drop.lat), dropLng: String(drop.lng), serviceType: id,
      });
      try {
        return [id, await estimateFare<FareEstimate>(query)] as const;
      } catch {
        return [id, null] as const;
      }
    }))
      .then((entries) => { if (!cancelled) setFares(Object.fromEntries(entries)); })
      .finally(() => { if (!cancelled) setLoadingFares(false); });

    optimizeRoute<{ polyline?: string }>({
      origin: { latitude: pickup.lat, longitude: pickup.lng },
      stops: [{ id: "drop", address: drop.address, latitude: drop.lat, longitude: drop.lng, type: "drop" }],
    })
      .then((res) => { if (!cancelled) setRoute(res?.polyline ? decodePolyline(res.polyline) : []); })
      .catch(() => { if (!cancelled) setRoute([]); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!pickup) return;
    let cancelled = false;
    const load = async () => {
      try {
        const list = await getNearbyDriversJson<any[]>(`latitude=${pickup.lat}&longitude=${pickup.lng}&radius=10000`);
        const mapped: NearbyDriver[] = (list || [])
          .map((d: any) => ({
            id: String(d._id || d.id),
            vehicleType: String(d.vehicleType || "bike"),
            lat: Number(d.currentLocation?.coordinates?.[1]),
            lng: Number(d.currentLocation?.coordinates?.[0]),
            heading: d.heading,
          }))
          .filter((d) => Number.isFinite(d.lat) && Number.isFinite(d.lng));
        if (!cancelled) setDrivers(mapped);
      } catch (error) {
        console.warn("Package delivery: could not load nearby captains", error);
      }
    };
    load();
    const timer = setInterval(load, DRIVER_REFRESH_MS);
    return () => { cancelled = true; clearInterval(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickup?.lat, pickup?.lng]);

  /** Minutes until the nearest captain with this vehicle could reach the pickup; null if none. */
  const pickupEta = (vehicle: PackageDeliveryVehicle) => {
    if (!pickup) return null;
    const nearest = drivers
      .filter((d) => driverMatches(d, vehicle))
      .reduce<number | null>((best, d) => {
        const km = distanceKm(pickup, d);
        return best == null || km < best ? km : best;
      }, null);
    return nearest == null ? null : Math.max(2, Math.round((nearest / PLANNING_SPEED_KMH) * 60));
  };

  return { fares, loadingFares, route, drivers, pickupEta };
}
