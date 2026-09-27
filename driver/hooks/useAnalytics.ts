import { useEffect } from "react";
import { useSegments } from "expo-router";
import { useDriverStore } from "@/store/driverStore";
import { setAnalyticsUserId, trackScreen } from "@/utils/analytics";

/**
 * Mounted once in app/_layout.tsx: logs a screen_view per route (as the route
 * pattern, e.g. "(tabs)/earnings", so IDs never leak into screen names) and
 * keeps the Analytics user ID in step with the signed-in driver.
 */
export function useAnalytics() {
  const segments = useSegments();
  const screenName = segments.join("/") || "index";
  const driverUserId = useDriverStore((s) => s.driverUserId);

  useEffect(() => {
    trackScreen(screenName);
  }, [screenName]);

  useEffect(() => {
    setAnalyticsUserId(driverUserId ? String(driverUserId) : null);
  }, [driverUserId]);
}
