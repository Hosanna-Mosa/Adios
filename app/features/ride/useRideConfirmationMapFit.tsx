import React from "react";
import { RouteOptimizeResponse, decodePolyline } from "./useRideConfirmation.shared";
import { optimizeRoute } from "@/services/places.service";
import { fetchNearbyDriverPins } from "@/utils/nearbyDrivers";
import { setForegroundInterval } from "@/utils/foregroundInterval";

// Split out of useRideConfirmation so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useRideConfirmationMapFit(params: any, selectedTier: any, pickupCoords: any, dropCoords: any, setNearbyDrivers: any, mapReady: any, setRouteCoordinates: any, stops: any, validStops: any, pickupIsValid: any, dropIsValid: any, tripCoordinates: any, fitTripToMap: any) {
  React.useEffect(() => {
    if (!mapReady || !pickupIsValid || !dropIsValid) return;
    fitTripToMap(false);
    const t1 = setTimeout(() => fitTripToMap(true), 250);
    const t2 = setTimeout(() => fitTripToMap(true), 750);
    const t3 = setTimeout(() => fitTripToMap(true), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [fitTripToMap, mapReady, pickupIsValid, dropIsValid]);

  React.useEffect(() => {
    if (!pickupIsValid || !dropIsValid) { setRouteCoordinates([]); return; }
    let cancelled = false;
    const loadBackendRoute = async () => {
      try {
        const route = await optimizeRoute<RouteOptimizeResponse>({
            origin: { latitude: pickupCoords.latitude, longitude: pickupCoords.longitude },
            stops: [
              ...validStops.map((s: any) => ({ id: s.id, address: s.name || s.address || "Stop", latitude: s.latitude, longitude: s.longitude, type: "stop" })),
              { id: "drop", address: params.dropName || "Drop", latitude: dropCoords.latitude, longitude: dropCoords.longitude, type: "drop" },
            ],
          });
        const decoded = route?.polyline ? decodePolyline(route.polyline) : [];
        if (!cancelled) setRouteCoordinates(decoded.length > tripCoordinates.length ? decoded : []);
      } catch (error) {
        console.warn("Backend route fetch failed:", error);
        if (!cancelled) setRouteCoordinates([]);
      }
    };
    loadBackendRoute();
    return () => { cancelled = true; };
  }, [pickupIsValid, dropIsValid, pickupCoords.latitude, pickupCoords.longitude, dropCoords.latitude, dropCoords.longitude, params.dropName, validStops, tripCoordinates.length]);

  React.useEffect(() => {
    const loadNearbyDrivers = async () => {
      if (!Number.isFinite(pickupCoords.latitude) || !Number.isFinite(pickupCoords.longitude)) return;
      try {
        setNearbyDrivers(await fetchNearbyDriverPins(pickupCoords.latitude, pickupCoords.longitude, { radius: 50000, fallbackVehicleType: selectedTier }));
      } catch (error) {
        console.warn("Unable to load nearby online drivers", error);
      }
    };
    loadNearbyDrivers();
    return setForegroundInterval(loadNearbyDrivers, 12000);
  }, [pickupCoords.latitude, pickupCoords.longitude, selectedTier]);

  return {  };
}
