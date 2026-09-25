import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-client";
import type { ActivitySummary, LiveActivity } from "../types";

export const WINDOW_OPTIONS = [15, 30, 60, 180] as const;
export const DAY_OPTIONS = [7, 14, 30] as const;

// The apps send their events every 10 s, so polling faster than this only
// re-reads the same data.
const LIVE_REFRESH_MS = 15_000;
const SUMMARY_REFRESH_MS = 5 * 60_000;

/** Data for the Live Activity page: what the customer and driver apps are doing right now. */
export function useLiveActivity() {
  const [minutes, setMinutes] = useState<number>(30);
  const [days, setDays] = useState<number>(7);

  const live = useQuery({
    queryKey: ["analytics", "live", minutes],
    queryFn: () => adminFetch<LiveActivity>(`/analytics/live?minutes=${minutes}`),
    refetchInterval: LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
  });

  const summary = useQuery({
    queryKey: ["analytics", "summary", days],
    queryFn: () => adminFetch<ActivitySummary>(`/analytics/summary?days=${days}`),
    refetchInterval: SUMMARY_REFRESH_MS,
  });

  return { minutes, setMinutes, days, setDays, live, summary };
}
