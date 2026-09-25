import { useEffect } from "react";
import { useSegments } from "expo-router";
import { useAuthStore } from "@/contexts/authStore";
import { setAnalyticsUserId, trackScreen } from "@/utils/analytics";

/**
 * Mounted once in app/_layout.tsx: logs a screen_view per route (as the route
 * pattern, e.g. "(tabs)/orders", so IDs never leak into screen names) and keeps
 * the Analytics user ID in step with the signed-in account.
 */
export function useAnalytics() {
  const segments = useSegments();
  const screenName = segments.join("/") || "index";
  const userId = useAuthStore((s) => s.user?._id ?? s.user?.id ?? null);

  useEffect(() => {
    trackScreen(screenName);
  }, [screenName]);

  useEffect(() => {
    setAnalyticsUserId(userId ? String(userId) : null);
  }, [userId]);
}
