import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { useDriverStore } from "@/store/driverStore";
import { syncDriverLocation } from "@/utils/locationSync";

/** Background location task — keeps reporting the driver's position while the
 * app is not in the foreground. Registered by importing this module. */
export const BACKGROUND_LOCATION_TASK = "BACKGROUND_DRIVER_LOCATION_TASK";

// Top-level Task Definition for Expo Background Location Updates
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }: any) => {
  if (error) {
    console.warn("[BackgroundLocation] Task error:", error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    if (locations && locations.length > 0) {
      const loc = locations[locations.length - 1];
      const { latitude, longitude, heading } = loc.coords;

      const store = useDriverStore.getState();
      store.updateDriverLocation(latitude, longitude);

      if (store.isOnline) {
        // Same throttled PATCH /drivers/location the foreground uses.
        await syncDriverLocation(latitude, longitude, heading);
      }
    }
  }
});
