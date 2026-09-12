import { useMemo, useRef, useState, useImperativeHandle, type Ref } from "react";
import MapView, { type Region } from "@/components/maps";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import type { DeliveryStop } from "@/contexts/deliveryStore";
import type { MapBackgroundRef } from "@/components/MapBackground";

// Camera state for MapBackground: the visible region, the zoom controls, and
// the imperative recenter/panTo/fitToRoute handle the screens drive it with.
// Moved out of components/MapBackground.tsx unchanged.

const FALLBACK_REGION: Region = {
  latitude: 17.385,
  longitude: 78.4867,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

interface Args {
  ref: Ref<MapBackgroundRef>;
  initialRegion?: Region;
  stops: DeliveryStop[];
  /** fitToRoute() includes the driver pin when there is one. */
  driverLocation?: { lat: number; lng: number } | null;
}

export function useMapCamera({ ref, initialRegion, stops, driverLocation }: Args) {
  const [region, setRegion] = useState<Region>(initialRegion || FALLBACK_REGION);
  const [autoRoutePolyline, setAutoRoutePolyline] = useState<string | null>(null);
  const selectedService = useDeliveryStore((state) => state.serviceType);

  const handleZoom = (factor: number) => {
    if (!internalMapRef.current || !region) return;
    const newRegion: Region = {
      latitude: region.latitude,
      longitude: region.longitude,
      latitudeDelta: Math.max(0.0005, Math.min(20, region.latitudeDelta * factor)),
      longitudeDelta: Math.max(0.0005, Math.min(20, region.longitudeDelta * factor)),
    };
    setRegion(newRegion);
    internalMapRef.current.animateToRegion(newRegion, 300);
  };
  const internalMapRef = useRef<MapView>(null);
  const locationRef = useRef<{ lat: number, lng: number } | null>(null);
  const validRouteStops = useMemo(
    () =>
      stops
        .map((stop) => ({
          ...stop,
          lat: Number(stop.lat),
          lng: Number(stop.lng),
        }))
        .filter((stop) => Number.isFinite(stop.lat) && Number.isFinite(stop.lng)),
    [stops],
  );

  const getRegionForLocation = (lat: number, lng: number, latDelta = 0.015, lngDelta = 0.015): Region => ({
    latitude: lat - (latDelta / 3), // offset slightly so pins are visible above bottom sheet
    longitude: lng,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  });

  useImperativeHandle(ref, () => ({
    recenter: () => {
      if (locationRef.current && internalMapRef.current) {
        internalMapRef.current.animateToRegion(getRegionForLocation(locationRef.current.lat, locationRef.current.lng), 1000);
      }
    },
    panTo: (lat: number, lng: number, delta = 0.005) => {
      if (internalMapRef.current && lat && lng) {
        internalMapRef.current.animateToRegion(getRegionForLocation(lat, lng, delta, delta), 1000);
      }
    },
    fitToRoute: () => {
      if (!internalMapRef.current) return;

      const coords: { latitude: number, longitude: number }[] = [];

      stops.forEach(s => {
        if (s.lat && s.lng) {
          coords.push({ latitude: s.lat, longitude: s.lng });
        }
      });

      if (locationRef.current) {
        coords.push({ latitude: locationRef.current.lat, longitude: locationRef.current.lng });
      }

      if (driverLocation) {
        coords.push({ latitude: driverLocation.lat, longitude: driverLocation.lng });
      }

      if (coords.length > 0) {
        internalMapRef.current.fitToCoordinates(coords, {
          edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
          animated: true,
        });
      }
    },
    fitToMarkers: (markerList: any[]) => {
      if (!internalMapRef.current || markerList.length === 0) return;
      const coords = markerList.map(m => ({ latitude: m.lat, longitude: m.lng }));
      if (locationRef.current) {
        coords.push({ latitude: locationRef.current.lat, longitude: locationRef.current.lng });
      }
      internalMapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 150, right: 80, bottom: 400, left: 80 },
        animated: true,
      });
    }
  }));

  return {
    region, setRegion, autoRoutePolyline, setAutoRoutePolyline,
    selectedService, handleZoom, internalMapRef, locationRef,
    validRouteStops, getRegionForLocation,
  };
}
