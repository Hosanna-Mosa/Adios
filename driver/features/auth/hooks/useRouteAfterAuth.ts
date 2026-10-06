import { router } from "expo-router";
import { Alert } from "react-native";
import i18n from "@/i18n";
import { useDriverStore } from "@/store/driverStore";

/** Where a driver lands once signed in: the tabs once an admin has approved
 * them, the verification status screen while their application is in review,
 * the onboarding flow otherwise. Refuses to route on a dead session. */
export function useRouteAfterAuth() {
  const { refreshSession } = useDriverStore();

  const routeAfterAuth = async () => {
    const sessionValid = await refreshSession();
    if (!sessionValid) {
      Alert.alert(i18n.t("auth.sessionExpired"), i18n.t("auth.pleaseSignInAgain"));
      return;
    }

    const { hasCompletedOnboarding, onboardingStatus } = useDriverStore.getState();
    const inReview =
      onboardingStatus === "pending_approval" ||
      onboardingStatus === "resubmission_required" ||
      onboardingStatus === "rejected";
    router.replace(hasCompletedOnboarding ? "/(tabs)" : inReview ? "/verification-status" : "/onboarding");
  };

  // ── Sign In ──────────────────────────────────────────────────

  return routeAfterAuth;
}
