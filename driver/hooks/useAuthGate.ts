import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { router, useSegments } from "expo-router";
import { useDriverStore } from "@/store/driverStore";

/** Waits for the persisted session to rehydrate, validates it, then keeps the
 * driver on the right screen: auth when signed out, onboarding when it is
 * unfinished, the tabs otherwise.
 *
 * Returns false until hydration completes — render nothing before then, or
 * the app flashes the auth screen at a signed-in driver. */
export function useAuthGate() {
  const segments = useSegments();
  const token = useDriverStore((s) => s.token);
  const isAuthenticated = useDriverStore((s) => s.isAuthenticated);
  const hasCompletedOnboarding = useDriverStore((s) => s.hasCompletedOnboarding);
  const loginPromptShown = useRef(false);
  const sessionChecked = useRef(false); // prevent double refresh

  const [hydrated, setHydrated] = useState(
    () => useDriverStore.persist.hasHydrated?.() ?? false,
  );
  const [needsLoginPrompt, setNeedsLoginPrompt] = useState(false);

  // ── Step 1: Hydrate the store from AsyncStorage ───────────────────────────
  useEffect(() => {
    const finishHydration = async () => {
      const state = useDriverStore.getState();

      if (state.isAuthenticated && state.token && !sessionChecked.current) {
        sessionChecked.current = true;
        const valid = await state.refreshSession();
        if (!valid) {
          state.logout();
          setNeedsLoginPrompt(true);
        }
      } else if (state.isAuthenticated && !state.token) {
        // Auth flag set but no token — clear stale state
        state.logout();
        setNeedsLoginPrompt(true);
      }

      setHydrated(true);
    };

    if (useDriverStore.persist.hasHydrated?.()) {
      finishHydration();
      return;
    }

    const unsub = useDriverStore.persist.onFinishHydration(() => {
      finishHydration();
    });

    return unsub;
  }, []);

  // ── Step 2: Route the user based on auth + onboarding state ──────────────
  useEffect(() => {
    if (!hydrated) return;

    const isLoggedIn = Boolean(isAuthenticated && token);
    const inAuth = segments[0] === "auth";
    const inOnboarding = segments[0] === "onboarding";

    if (!isLoggedIn) {
      // Unauthenticated → always go to auth screen
      if (!inAuth) {
        router.replace("/auth");
      }
      // Show a helpful alert if session expired
      if (needsLoginPrompt && !loginPromptShown.current) {
        loginPromptShown.current = true;
        Alert.alert("Login required", "Please sign in again to continue as a driver.");
        setNeedsLoginPrompt(false);
      }
      return;
    }

    // Authenticated: guard auth/onboarding screens
    if (hasCompletedOnboarding) {
      if (inAuth || inOnboarding) {
        router.replace("/(tabs)");
      }
      return;
    }

    // Authenticated but onboarding incomplete
    const isAllowedOnboardingScreen = inOnboarding || segments[0] === "zone-map";
    if (!isAllowedOnboardingScreen) {
      router.replace("/onboarding");
    }
  }, [hydrated, isAuthenticated, token, hasCompletedOnboarding, needsLoginPrompt, segments]);

  return { hydrated, token };
}
