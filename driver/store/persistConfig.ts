import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage } from "zustand/middleware";

import type { DriverState } from "./types";

export const persistConfig = {
  name: "driver-store",
  storage: createJSONStorage(() => AsyncStorage),
  partialize: (state: DriverState) => ({
    isAuthenticated: state.isAuthenticated,
    hasCompletedOnboarding: state.hasCompletedOnboarding,
    identityVerified: state.identityVerified,
    driverName: state.driverName,
    driverPhone: state.driverPhone,
    driverUserId: state.driverUserId,
    token: state.token,
    // Shift status survives a reload: the server keeps the driver ONLINE
    // across one, so dropping these left the app claiming OFFLINE while
    // dispatch still considered them on shift.
    isOnline: state.isOnline,
    activeServices: state.activeServices,
    // Note: earnings and orderHistory are NOT persisted so fresh data
    // is always fetched from the API on each session start.
    activeChat: state.activeChat,
  }),
};
