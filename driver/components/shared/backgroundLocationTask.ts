import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { useDriverStore } from "@/store/driverStore";
import { API_URL } from "@/utils/apiUrl";
import { socketService } from "@/utils/socketService";

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
        // 1. Socket location broadcast if connected
        try {
          socketService.emit("driver_location_update", {
            driverId: store.driverPhone || store.driverUserId || "driver-123",
            lat: latitude,
            lng: longitude,
            heading: heading || 0,
            orderId: store.currentOrder?.id,
          });
        } catch (e) {}

        // 2. HTTP REST update to ensure backend MongoDB & Redis remain updated even if OS pauses WebSocket
        if (store.token) {
          try {
            const apiUrl = API_URL;
            await fetch(`${apiUrl}/drivers/location`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${store.token}`,
              },
              body: JSON.stringify({
                latitude: latitude,
                longitude: longitude,
              }),
            });
          } catch (fetchErr) {
            console.warn("[BackgroundLocation] REST location update failed:", fetchErr);
          }
        }
      }
    }
  }
});
