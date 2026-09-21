import React, { useEffect, useRef } from "react";
import * as Location from "expo-location";
import { useDriverStore } from "@/store/driverStore";
import { socketService } from "@/utils/socketService";
import { requestTrackingPermissions } from "./locationPermissions";
import { syncBackgroundTracking } from "./backgroundTracking";

/** Starts and stops location tracking as the driver goes on and off duty,
 * asking for the permissions it needs. Split out of LocationHandler. */
export function useLocationTracking({
  isOnline,
  driverPhone,
  driverUserId,
  currentOrder,
  isCheckingPermissions,
}: {
  isOnline: boolean;
  driverPhone: string | null;
  driverUserId: string | null;
  currentOrder: any;
  /** Shared with LocationHandler so a permission prompt sending the app to the
   * background does not get mistaken for the driver leaving the app. */
  isCheckingPermissions: React.MutableRefObject<boolean>;
}) {
  const watcher = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let isMounted = true;

    const setupTracking = async () => {
      isCheckingPermissions.current = true;
      try {
        const { foregroundGranted } = await requestTrackingPermissions();
        if (!foregroundGranted) return;

        // 1. Get Initial Location Fast (LastKnown)
        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown && isMounted) {
          if (isOnline) {
            updateAndBroadcast(lastKnown.coords.latitude, lastKnown.coords.longitude);
          } else {
            updateLocalOnly(lastKnown.coords.latitude, lastKnown.coords.longitude);
          }
        }

        // 2. Get Current Location (Balanced)
        try {
          const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (current && isMounted) {
            if (isOnline) {
              updateAndBroadcast(current.coords.latitude, current.coords.longitude);
            } else {
              updateLocalOnly(current.coords.latitude, current.coords.longitude);
            }
          }
        } catch (e) {}

        // 3. Start High-Accuracy Foreground Watch
        if (watcher.current) {
          watcher.current.remove();
          watcher.current = null;
        }

        watcher.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000, // 5 seconds
            distanceInterval: 10, // 10 meters
          },
          (location) => {
            if (isMounted) {
              if (isOnline) {
                updateAndBroadcast(location.coords.latitude, location.coords.longitude, location.coords.heading || 0);
              } else {
                updateLocalOnly(location.coords.latitude, location.coords.longitude);
              }
            }
          }
        );

        // 4. Background Location Service Management
          await syncBackgroundTracking(isOnline);
      } finally {
        isCheckingPermissions.current = false;
      }
    };

    const updateLocalOnly = (lat: number, lng: number) => {
      const { updateDriverLocation } = useDriverStore.getState();
      updateDriverLocation(lat, lng);
    };

    const updateAndBroadcast = (lat: number, lng: number, heading?: number) => {
      updateLocalOnly(lat, lng);

      if (isOnline) {
        socketService.emit("driver_location_update", {
          driverId: driverPhone || driverUserId || "driver-123",
          lat: lat,
          lng: lng,
          heading: heading || 0,
          orderId: currentOrder?.id,
        });
      }
    };

    setupTracking();

    return () => {
      isMounted = false;
      if (watcher.current) {
        watcher.current.remove();
        watcher.current = null;
      }
    };
  }, [isOnline, currentOrder?.id, driverPhone, driverUserId]);

  return null;
}
