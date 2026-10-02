import { API_URL as apiUrl } from "@/utils/apiUrl";
import { EMPTY_WEEK } from "../initialState";
import type { DriverState, GetDriverState, SetDriverState } from "../types";

/**
 * Fetches real earnings data from the backend and updates the store.
 * Called from the home screen on mount and on pull-to-refresh.
 *
 * Backend returns:
 *   { availableBalance, weekBalance, todayBalance, trendPercent, weeklyBreakdown,
 *     stats: { completedTrips, completedTripsToday, onlineHours, totalDistance } }
 */
export const createEarningsSlice = (
  set: SetDriverState,
  get: GetDriverState,
): Pick<DriverState, "fetchEarnings"> => ({
  fetchEarnings: async () => {
    const { token } = get();
    if (!token || !apiUrl) return;
    try {
      const res = await fetch(`${apiUrl}/drivers/earnings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return; // silently ignore — keep whatever is in store
      const data = await res.json();

      set({
        earnings: {
          today: data.todayBalance ?? 0,
          week: data.weekBalance ?? 0,
          totalDeliveries: data.stats?.completedTrips ?? 0,
          todayTrips: data.stats?.completedTripsToday ?? 0,
          weeklyBreakdown:
            Array.isArray(data.weeklyBreakdown) && data.weeklyBreakdown.length > 0
              ? data.weeklyBreakdown
              : EMPTY_WEEK,
        },
      });
    } catch (err) {
      console.warn("fetchEarnings failed:", err);
    }
  },
});
