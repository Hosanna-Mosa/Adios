import { Alert } from "react-native";

import { API_URL as apiUrl } from "@/utils/apiUrl";
import { trackEvent } from "@/utils/analytics";
import { decodeJwtPayload } from "../decodeJwt";
import { registerOrderSocketHandlers } from "../socketHandlers";
import type { DriverState, GetDriverState, SetDriverState } from "../types";

const patchDriver = (token: string, path: string, body: Record<string, any>) =>
  fetch(`${apiUrl}/drivers/${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

export const createOnlineSlice = (
  set: SetDriverState,
  get: GetDriverState,
): Pick<DriverState, "goOnline" | "goOffline" | "toggleHomeMode"> => ({
  goOnline: async (services) => {
    set({ isOnline: true, activeServices: services });
    trackEvent("go_online", { services: services.join(",") });
    const { token, driverUserId } = get();
    if (token) {
      try {
        await patchDriver(token, "status", { status: "ONLINE" });
      } catch (e) {
        console.error("Failed to set online status:", e);
      }
    }

    // Older sessions were stored without a driver id — recover it from the JWT.
    let finalDriverId = driverUserId;
    if (!finalDriverId && token) {
      const decoded = decodeJwtPayload(token);
      if (decoded && (decoded.userId || decoded.id)) {
        finalDriverId = decoded.userId || decoded.id;
        set({ driverUserId: finalDriverId }); // Self-heal store
      }
    }

    // Connect to real-time order broadcasts regardless of token
    import("../../utils/socketService").then(({ socketService }) => {
      socketService.connect();
      socketService.join(finalDriverId || "mock_driver_123", "DRIVER");
      registerOrderSocketHandlers(socketService, set, get);
    });
  },

  goOffline: async () => {
    set({ isOnline: false, homeMode: false });
    trackEvent("go_offline");
    const { token } = get();
    if (token) {
      try {
        await patchDriver(token, "status", { status: "OFFLINE" });
      } catch (e) {
        console.error("Failed to set offline status:", e);
      }
    }

    import("../../utils/socketService").then(({ socketService }) => {
      socketService.off("new_order", () => {}); // Remove listener
      socketService.off("order_offer_expired", () => {}); // Remove listener
      socketService.off("order_cancelled", () => {}); // Remove listener
      socketService.off("upcoming_reserved_ride", () => {}); // Remove listener
      socketService.disconnect();
    });
  },

  toggleHomeMode: async () => {
    const nextMode = !get().homeMode;
    const { token } = get();
    if (token) {
      try {
        const res = await patchDriver(token, "home-mode", { homeMode: nextMode });
        if (!res.ok) {
          const data = await res.json();
          Alert.alert("Home Mode Error", data.message || "Failed to update home mode.");
          return;
        }
      } catch (e: any) {
        console.error("Failed to update home mode on backend:", e);
        Alert.alert("Home Mode Error", "Connection failed. Please try again.");
        return;
      }
    }
    set({ homeMode: nextMode });
  },
});
