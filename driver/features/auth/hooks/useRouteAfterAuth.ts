import { router } from "expo-router";
import { Alert } from "react-native";
import { useDriverStore } from "@/store/driverStore";

/** Where a driver lands once signed in: the tabs if onboarding is finished,
 * the onboarding flow if not. Refuses to route on a dead session. */
export function useRouteAfterAuth() {
  const { refreshSession } = useDriverStore();

  const routeAfterAuth = async () => {
    const sessionValid = await refreshSession();
    if (!sessionValid) {
      Alert.alert("Session expired", "Please sign in again.");
      return;
    }

    const { hasCompletedOnboarding } = useDriverStore.getState();
    router.replace(hasCompletedOnboarding ? "/(tabs)" : "/onboarding");
  };

  // ── Sign In ──────────────────────────────────────────────────

  return routeAfterAuth;
}
