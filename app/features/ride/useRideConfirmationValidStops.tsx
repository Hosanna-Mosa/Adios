import React, { useMemo } from "react";
import { Platform } from "react-native";
import { isValidCoordinate } from "./useRideConfirmation.shared";

// Split out of useRideConfirmation so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useRideConfirmationValidStops(pickupCoords: any, dropCoords: any, mapRef: any, stops: any) {
  const validStops = useMemo(
    () =>
      stops
        .map((stop: any) => ({ ...stop, latitude: Number(stop.lat), longitude: Number(stop.lng) }))
        .filter((stop: any) => isValidCoordinate({ latitude: stop.latitude, longitude: stop.longitude })),
    [stops]
  );

  const pickupIsValid = isValidCoordinate(pickupCoords);
  const dropIsValid = isValidCoordinate(dropCoords);
  const tripCoordinates = useMemo(() => {
    if (!pickupIsValid || !dropIsValid) return [];
    return [pickupCoords, ...validStops.map((s: any) => ({ latitude: s.latitude, longitude: s.longitude })), dropCoords];
  }, [pickupIsValid, dropIsValid, pickupCoords, dropCoords, validStops]);

  const fitTripToMap = React.useCallback(
    (animated = true) => {
      if (!mapRef.current || !pickupIsValid || !dropIsValid) return;
      const pointsToFit = [pickupCoords, ...validStops.map((s: any) => ({ latitude: s.latitude, longitude: s.longitude })), dropCoords];
      if (pointsToFit.length < 2) return;
      mapRef.current.fitToCoordinates(pointsToFit, {
        edgePadding: { top: Platform.OS === "ios" ? 110 : 90, right: 60, bottom: 60, left: 60 },
        animated,
      });
    },
    [pickupCoords, dropCoords, validStops, pickupIsValid, dropIsValid]
  );

  const initialRegion = useMemo(() => {
    if (!pickupIsValid && !dropIsValid) return { latitude: 17.0005, longitude: 81.78, latitudeDelta: 0.05, longitudeDelta: 0.05 };
    if (!dropIsValid) return { ...pickupCoords, latitudeDelta: 0.04, longitudeDelta: 0.04 };
    if (!pickupIsValid) return { ...dropCoords, latitudeDelta: 0.04, longitudeDelta: 0.04 };
    const minLat = Math.min(pickupCoords.latitude, dropCoords.latitude);
    const maxLat = Math.max(pickupCoords.latitude, dropCoords.latitude);
    const minLng = Math.min(pickupCoords.longitude, dropCoords.longitude);
    const maxLng = Math.max(pickupCoords.longitude, dropCoords.longitude);
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latDelta = Math.max((maxLat - minLat) * 1.8, 0.025);
    const lngDelta = Math.max((maxLng - minLng) * 1.8, 0.025);
    return { latitude: centerLat - latDelta * 0.18, longitude: centerLng, latitudeDelta: latDelta, longitudeDelta: lngDelta };
  }, [pickupCoords, dropCoords, pickupIsValid, dropIsValid]);

  return { validStops, pickupIsValid, dropIsValid, tripCoordinates, fitTripToMap, initialRegion };
}
