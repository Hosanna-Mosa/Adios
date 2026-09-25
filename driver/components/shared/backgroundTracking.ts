import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { Colors } from "@/constants/colors";
import i18n from "@/i18n";
import { BACKGROUND_LOCATION_TASK } from "./backgroundLocationTask";

/** Turn background location on when the driver goes online, off when they
 * go offline. Asks for the background permission only when actually needed. */
export async function syncBackgroundTracking(isOnline: boolean) {
  try {
    const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);

    if (!isOnline) {
      if (isTaskRegistered) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        console.log("[LocationHandler] Background location tracking stopped.");
      }
      return;
    }

    const { status: bgCheck } = await Location.getBackgroundPermissionsAsync();
    let bgStatus = bgCheck;
    if (bgStatus !== "granted") {
      const requested = await Location.requestBackgroundPermissionsAsync();
      bgStatus = requested.status;
    }
    if (bgStatus !== "granted") {
      console.warn("[LocationHandler] Background location permission not granted.");
      return;
    }

    if (!isTaskRegistered) {
      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000, // 10 seconds in background
        distanceInterval: 10, // 10 meters
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: i18n.t("jobs.flavourDriverActive"),
          notificationBody: i18n.t("jobs.trackingLocationForOrderDispatches"),
          notificationColor: Colors.successBright,
        },
      });
      console.log("[LocationHandler] Background location tracking started.");
    }
  } catch (bgErr) {
    console.warn("[LocationHandler] Error handling background location updates:", bgErr);
  }
}
