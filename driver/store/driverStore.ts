import { create } from "zustand";
import { persist } from "zustand/middleware";

import { initialState } from "./initialState";
import { persistConfig } from "./persistConfig";
import { createAuthSlice } from "./slices/authSlice";
import { createChatSlice } from "./slices/chatSlice";
import { createEarningsSlice } from "./slices/earningsSlice";
import { createOnlineSlice } from "./slices/onlineSlice";
import { createOrderLifecycleSlice } from "./slices/orderLifecycleSlice";
import { createOrderStatusSlice } from "./slices/orderStatusSlice";
import { createReservedRideSlice } from "./slices/reservedRideSlice";
import type { DriverState } from "./types";

export * from "./types";

export const useDriverStore = create<DriverState>()(
  persist(
    (set, get) => ({
      ...initialState,
      ...createOnlineSlice(set, get),
      ...createReservedRideSlice(set, get),
      ...createOrderLifecycleSlice(set, get),
      ...createOrderStatusSlice(set, get),
      ...createAuthSlice(set, get),
      ...createChatSlice(set),
      ...createEarningsSlice(set, get),
    }),
    persistConfig,
  ),
);
