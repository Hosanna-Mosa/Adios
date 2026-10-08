import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import type MapView from "react-native-maps";

import { LOCATION_FAST_INTERVAL_MS, syncDriverLocation } from "@/utils/locationSync";
import { fitMapToCoords, stopCoords, type LatLng } from "../mapFit";

/** Live GPS + compass for the driver marker, plus the initial map framing. */
export function useDriverTracking(
  currentOrder: any,
  driverPhone: string | undefined,
  pickupStop: any,
  deliveryStop: any,
  onNoOrder: () => void,
) {
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [driverHeading, setDriverHeading] = useState<number>(0);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    if (!currentOrder) {
      onNoOrder();
      return;
    }

    let locationSub: Location.LocationSubscription | null = null;
    let headingSub: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setDriverLocation({ lat: 12.9716, lng: 77.5946 }); // Fallback to Bangalore
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const initialLoc = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      setDriverLocation(initialLoc);
      if (typeof loc.coords.heading === "number" && loc.coords.heading >= 0) {
        setDriverHeading(loc.coords.heading);
      }

      try {
        locationSub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 5 },
          (newLoc) => {
            if (!newLoc?.coords) return;
            setDriverLocation({ lat: newLoc.coords.latitude, lng: newLoc.coords.longitude });
            if (typeof newLoc.coords.heading === "number" && newLoc.coords.heading >= 0) {
              setDriverHeading(newLoc.coords.heading);
            }
          },
        );
      } catch (lErr) {
        console.warn("[Location Watcher] Failed:", lErr);
      }

      // Rotates the marker as the phone itself turns.
      try {
        headingSub = await Location.watchHeadingAsync(({ trueHeading, magHeading }) => {
          const h = trueHeading !== undefined && trueHeading >= 0 ? trueHeading : magHeading;
          if (typeof h === "number" && !isNaN(h)) setDriverHeading(h);
        });
      } catch (headingErr) {
        console.warn("[Heading Watcher] Compass sensor watch failed/unavailable:", headingErr);
      }

      const coords: LatLng[] = [{ latitude: initialLoc.lat, longitude: initialLoc.lng }];
      const p = stopCoords(pickupStop);
      const d = stopCoords(deliveryStop);
      if (p) coords.push(p);
      if (d) coords.push(d);

      setTimeout(() => fitMapToCoords(mapRef.current, coords, initialLoc, 0.03, 500), 500);
    })();

    return () => {
      locationSub?.remove();
      headingSub?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrder]);

  // Report position + heading during the job (the shared helper throttles).
  const lastHeadingSent = useRef<number>(0);
  const lastHeadingTime = useRef<number>(Date.now());
  useEffect(() => {
    if (!currentOrder || !driverLocation) return;
    const now = Date.now();
    if (
      Math.abs(driverHeading - lastHeadingSent.current) > 10 &&
      now - lastHeadingTime.current > 1000
    ) {
      lastHeadingSent.current = driverHeading;
      lastHeadingTime.current = now;
      syncDriverLocation(driverLocation.lat, driverLocation.lng, driverHeading, {
        minIntervalMs: LOCATION_FAST_INTERVAL_MS,
      });
    }
  }, [driverHeading, driverLocation, currentOrder]);

  return { driverLocation, setDriverLocation, driverHeading, setDriverHeading, mapRef };
}
