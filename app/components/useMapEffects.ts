import { useEffect, useRef, type Dispatch, type SetStateAction, type RefObject } from "react";
import * as Location from "expo-location";
import MapView, { type Region } from "@/components/maps";
import type { DeliveryStop } from "@/contexts/deliveryStore";
import { optimizeRoute } from "@/services/places.service";

// The map's side effects: initial region, GPS watch, route fetching and the
// auto-zoom that fits a radius circle. Moved out of MapBackground unchanged —
// each effect keeps its original dependency array.

interface Args {
  initialRegion?: Region;
  stops: DeliveryStop[];
  polyline?: string | null;
  driverLocation?: { lat: number; lng: number } | null;
  userLocation?: { lat: number; lng: number } | null;
  onLocationUpdate?: (coords: { lat: number; lng: number }) => void;
  radiusCenter?: { lat: number; lng: number } | null;
  radiusMeters?: number | null;
  region: Region;
  setRegion: Dispatch<SetStateAction<Region>>;
  setAutoRoutePolyline: Dispatch<SetStateAction<string | null>>;
  internalMapRef: RefObject<MapView | null>;
  locationRef: RefObject<{ lat: number; lng: number } | null>;
  validRouteStops: DeliveryStop[];
  getRegionForLocation: (lat: number, lng: number, latDelta?: number, lngDelta?: number) => Region;
}

export function useMapEffects({
  initialRegion, stops, polyline, driverLocation, userLocation, onLocationUpdate,
  radiusCenter, radiusMeters, region, setRegion, setAutoRoutePolyline,
  internalMapRef, locationRef, validRouteStops, getRegionForLocation,
}: Args) {
  const hasFocusedRoute = useRef(false);

  // Auto-center map on userLocation and driverLocation dynamically just once
  useEffect(() => {
    if (internalMapRef.current && userLocation && driverLocation && !hasFocusedRoute.current) {
      hasFocusedRoute.current = true;
      internalMapRef.current.fitToCoordinates([
        { latitude: Number(userLocation.lat), longitude: Number(userLocation.lng) },
        { latitude: Number(driverLocation.lat), longitude: Number(driverLocation.lng) }
      ], {
        edgePadding: { top: 120, right: 80, bottom: 430, left: 80 }, // keep bottom high to clear the success BottomSheet
        animated: true,
      });
    } else if (internalMapRef.current && userLocation && !hasFocusedRoute.current && !driverLocation) {
      const regionForUser = getRegionForLocation(userLocation.lat, userLocation.lng, 0.015, 0.015);
      internalMapRef.current.animateToRegion(regionForUser, 1000);
    }
  }, [userLocation, driverLocation]);

  useEffect(() => {
    if (initialRegion) {
      setRegion(initialRegion);
      return;
    }

    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }

        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown) {
          locationRef.current = { lat: lastKnown.coords.latitude, lng: lastKnown.coords.longitude };
          setRegion(getRegionForLocation(lastKnown.coords.latitude, lastKnown.coords.longitude));
          onLocationUpdate?.({ lat: lastKnown.coords.latitude, lng: lastKnown.coords.longitude });
        }

        let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        locationRef.current = { lat: location.coords.latitude, lng: location.coords.longitude };
        setRegion(getRegionForLocation(location.coords.latitude, location.coords.longitude));
        if (onLocationUpdate) {
          onLocationUpdate({ lat: location.coords.latitude, lng: location.coords.longitude });
        }
      } catch (error) {
        // Graceful fallback if device GPS is fully disabled
        console.warn("Location services unavailable:", error);

      }
    })();
  }, [initialRegion]);
  useEffect(() => {
    if (!internalMapRef.current || userLocation || driverLocation) return;

    const coords: { latitude: number, longitude: number }[] = [];

    stops.forEach((stop) => {
      if (stop.lat && stop.lng) {
        coords.push({ latitude: stop.lat, longitude: stop.lng });
      }
    });

    if (coords.length > 1) {
      internalMapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 110, right: 60, bottom: 340, left: 60 },
        animated: true,
      });
    } else if (coords.length === 1) {
      internalMapRef.current.animateToRegion(
        getRegionForLocation(coords[0].latitude, coords[0].longitude, 0.018, 0.018),
        600,
      );
    }
  }, [stops]);

  useEffect(() => {
    if (polyline || validRouteStops.length < 2) {
      setAutoRoutePolyline(null);
      return;
    }

    let cancelled = false;

    const loadRoadRoute = async () => {
      try {
        const [origin, ...destinationStops] = validRouteStops;
        const route = await optimizeRoute<{ polyline?: string; routeSource?: string }>({
            origin: {
              latitude: origin.lat,
              longitude: origin.lng,
            },
            stops: destinationStops.map((stop, index) => ({
              id: stop.id || `stop-${index}`,
              address: stop.address || stop.storeName || `Stop ${index + 1}`,
              latitude: stop.lat,
              longitude: stop.lng,
              type: stop.type || "stop",
            })),
          });

        if (!cancelled) {
          setAutoRoutePolyline(route?.polyline || null);
        }
      } catch (error) {
        console.warn("MapBackground route fetch failed:", error);
        if (!cancelled) setAutoRoutePolyline(null);
      }
    };

    loadRoadRoute();

    return () => {
      cancelled = true;
    };
  }, [polyline, validRouteStops]);

  // Auto-zoom to fit the radius circle when it changes
  useEffect(() => {
    if (radiusCenter && radiusMeters && internalMapRef.current) {
      // 1 degree is approximately 111.32 km. We multiply by a padding factor (~2.5) to ensure the circle fits nicely.
      const latDelta = (radiusMeters / 111320) * 2.5;
      const lngDelta = (radiusMeters / (111320 * Math.cos(radiusCenter.lat * (Math.PI / 180)))) * 2.5;

      const regionForCircle = {
        latitude: radiusCenter.lat,
        longitude: radiusCenter.lng,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      };

      internalMapRef.current.animateToRegion(regionForCircle, 800);
    }
  }, [radiusCenter, radiusMeters]);
}
