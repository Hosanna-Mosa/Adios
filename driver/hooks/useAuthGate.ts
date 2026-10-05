import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { router, useSegments } from "expo-router";
import { useDriverStore } from "@/store/driverStore";
import { useLanguageStore } from "@/store/languageStore";

/** Where a signed-in driver belongs: the tabs once approved, the status screen
 * while in review (or turned down), onboarding otherwise. */
export function signedInHome(state: { hasCompletedOnboarding: boolean; onboardingStatus?: string | null }) {
  if (state.hasCompletedOnboarding) return "/(tabs)" as const;
  const inReview =
    state.onboardingStatus === "pending_approval" ||
    state.onboardingStatus === "resubmission_required" ||
    state.onboardingStatus === "rejected";
  return inReview ? ("/verification-status" as const) : ("/onboarding" as const);
}

/** Waits for the persisted session to rehydrate, validates it, then keeps the
 * driver on the right screen: the language gate first (when not yet
 * confirmed this process), auth when signed out, onboarding when it is
 * unfinished, the tabs otherwise.
 *
 * Returns false until hydration completes — render nothing before then, or
 * the app flashes the auth screen at a signed-in driver. */
export function useAuthGate() {
  const { t } = useTranslation();
  const segments = useSegments();
  const token = useDriverStore((s) => s.token);
  const isAuthenticated = useDriverStore((s) => s.isAuthenticated);
  const hasCompletedOnboarding = useDriverStore((s) => s.hasCompletedOnboarding);
  const onboardingStatus = useDriverStore((s) => s.onboardingStatus);
  const languageConfirmed = useLanguageStore((s) => s.languageConfirmed);
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
      // The language gate takes priority over the rest of the auth flow, so
      // /auth (and every other unauthenticated screen) is read in the
      // driver's chosen language. `languageConfirmed` is in-memory only —
      // reset on every cold start and after logout — so a *persisted*
      // language choice can pre-select an option on that screen without
      // ever letting it be skipped outright.
      if (!languageConfirmed) {
        if (segments[0] !== "select-language") {
          router.replace("/select-language");
        }
        return;
      }

      // Unauthenticated → always go to auth screen
      if (!inAuth) {
        router.replace("/auth");
      }
      // Show a helpful alert if session expired
      if (needsLoginPrompt && !loginPromptShown.current) {
        loginPromptShown.current = true;
        Alert.alert(t("auth.loginRequired"), t("auth.pleaseSignInAgainToContinueAsDriver"));
        setNeedsLoginPrompt(false);
      }
      return;
    }

    // Authenticated: guard auth/onboarding screens. The language gate is for
    // signed-out drivers only — a signed-in one who reaches it (the session
    // finished restoring after the gate had already opened) used to be stuck
    // there, with Continue doing nothing.
    if (hasCompletedOnboarding) {
      if (inAuth || inOnboarding || segments[0] === "verification-status" || segments[0] === "select-language") {
        router.replace("/(tabs)");
      }
      return;
    }

    // Submitted and waiting on an admin, or turned down / asked for documents:
    // the status screen explains which. Documents requested (or a rejection)
    // may be fixed by going back through onboarding, so those screens stay open.
    const inReview =
      onboardingStatus === "pending_approval" ||
      onboardingStatus === "resubmission_required" ||
      onboardingStatus === "rejected";
    const canEditDocuments = onboardingStatus !== "pending_approval";

    if (inReview && (segments[0] === "verification-status" || !canEditDocuments)) {
      if (segments[0] !== "verification-status") router.replace("/verification-status");
      return;
    }

    // Authenticated but onboarding incomplete. Screens reachable *from* the
    // onboarding flow have to be listed here — anything else gets bounced back
    // to /onboarding, which remounts it and loses the driver's progress.
    const ALLOWED_DURING_ONBOARDING = [
      "onboarding",
      // Re-uploading documents an admin asked for (from verification-status).
      "reupload-documents",
      "zone-map",
      "digilocker-verify",
      // Where the DigiLocker deep link lands. It pops itself immediately, but
      // it has to survive this guard long enough to do so.
      "digilocker-callback",
      "identity-verify",
    ];
    if (!ALLOWED_DURING_ONBOARDING.includes(segments[0] as string)) {
      router.replace(inReview ? "/verification-status" : "/onboarding");
    }
  }, [hydrated, isAuthenticated, token, hasCompletedOnboarding, onboardingStatus, needsLoginPrompt, segments, languageConfirmed, t]);

  return { hydrated, token };
}
