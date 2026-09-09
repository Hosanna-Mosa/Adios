import React from "react";
import { customFetch } from "@/utils/api/custom-fetch";
import { RouteOptimizeResponse, decodePolyline } from "./useRideConfirmation.shared";

// Part 3 of useRideConfirmation, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useRideConfirmationPart3(params: any, selectedTier: any, pickupCoords: any, dropCoords: any, setNearbyDrivers: any, mapReady: any, setRouteCoordinates: any, stops: any, validStops: any, pickupIsValid: any, dropIsValid: any, tripCoordinates: any, fitTripToMap: any) {
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
        const route = await customFetch<RouteOptimizeResponse>("/routing/optimize", {
          method: "POST",
          body: JSON.stringify({
            origin: { latitude: pickupCoords.latitude, longitude: pickupCoords.longitude },
            stops: [
              ...validStops.map((s: any) => ({ id: s.id, address: s.name || s.address || "Stop", latitude: s.latitude, longitude: s.longitude, type: "stop" })),
              { id: "drop", address: params.dropName || "Drop", latitude: dropCoords.latitude, longitude: dropCoords.longitude, type: "drop" },
            ],
          }),
          responseType: "json",
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
        const drivers = await customFetch<any[]>(
          `/drivers/nearby?latitude=${pickupCoords.latitude}&longitude=${pickupCoords.longitude}&radius=50000`,
          { responseType: "json" }
        );
        const mapped = (drivers || [])
          .map((driver: any) => ({
            id: driver._id || driver.id,
            vehicleType: driver.vehicleType || selectedTier,
            lat: driver.currentLocation?.coordinates?.[1] || driver.user?.addresses?.[0]?.location?.coordinates?.[1],
            lng: driver.currentLocation?.coordinates?.[0] || driver.user?.addresses?.[0]?.location?.coordinates?.[0],
          }))
          .filter((d: any) => Number.isFinite(d.lat) && Number.isFinite(d.lng));
        setNearbyDrivers(mapped);
      } catch (error) {
        console.warn("Unable to load nearby online drivers", error);
      }
    };
    loadNearbyDrivers();
    const interval = setInterval(loadNearbyDrivers, 12000);
    return () => clearInterval(interval);
  }, [pickupCoords.latitude, pickupCoords.longitude, selectedTier]);

  return {  };
}
