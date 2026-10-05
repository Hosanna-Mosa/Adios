import React, { useEffect } from "react";
import { AppState, Platform } from "react-native";
import { useFonts } from "expo-font";
import {
  FamiljenGrotesk_400Regular,
  FamiljenGrotesk_500Medium,
  FamiljenGrotesk_600SemiBold,
  FamiljenGrotesk_700Bold,
} from "@expo-google-fonts/familjen-grotesk";
import { Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold } from "@expo-google-fonts/figtree";
import { focusManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Side-effect import: pairs each Text/TextInput weight with its font file.
import "@/constants/applyFontPatch";
import i18n from "@/i18n";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RootLayoutNav } from "@/components/RootLayoutNav";
import { GlobalSocketHandler } from "@/components/GlobalSocketHandler";
import { PushNotificationHandler } from "@/components/PushNotificationHandler";
import { NewOrderBanner } from "@/components/shared/NewOrderBanner";
import { ScheduledRequestSheet } from "@/components/shared/ScheduledRequestSheet";
import { AppAlert, showAlert } from "@/components/ui/AppAlert";
import { ToastProvider } from "@/components/ui/Toast";
import { useAuthStore } from "@/contexts/authStore";
import { useLanguageStore } from "@/contexts/languageStore";
import { useThemeStore } from "@/contexts/themeStore";
import { setAuthTokenGetter, setBaseUrl, setUnauthorizedHandler } from "@/utils/api/custom-fetch";
import { env } from "@/utils/env";

if (env.apiUrl) setBaseUrl(env.apiUrl);

setAuthTokenGetter(() => useAuthStore.getState().token);

// The API answers 401 — and only 401 — for a missing, expired or revoked token.
// handleUnauthorized returns true only for the first of a burst of parallel 401s,
// so the partner sees one notice; the auth gate below handles the redirect.
setUnauthorizedHandler(() => {
  if (useAuthStore.getState().handleUnauthorized()) {
    showAlert(i18n.t("auth.sessionExpiredTitle"), i18n.t("auth.sessionExpiredMessage"), undefined, "warning");
  }
});

// Refetch stale queries when the app comes back to the foreground — React
// Native has no window focus event for TanStack Query to listen to.
focusManager.setEventListener((handleFocus) => {
  if (Platform.OS === "web") return undefined;
  const subscription = AppState.addEventListener("change", (status) => handleFocus(status === "active"));
  return () => subscription.remove();
});

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 15_000 },
  },
});

const AUTH_ROUTES = ["login", "forgot-password", "select-language"];

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    FamiljenGrotesk_400Regular,
    FamiljenGrotesk_500Medium,
    FamiljenGrotesk_600SemiBold,
    FamiljenGrotesk_700Bold,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });
  const fontsReady = fontsLoaded || !!fontError;

  const token = useAuthStore((s) => s.token);
  const authReady = useAuthStore((s) => s.isInitialized);
  const language = useLanguageStore((s) => s.language);
  const languageReady = useLanguageStore((s) => s.isHydrated);
  const segments = useSegments();
  const ready = fontsReady && authReady && languageReady;

  // Restore the session, theme and language before the splash hides, so the
  // app never flashes the wrong screen, theme or language.
  useEffect(() => {
    if (!fontsReady) return;
    Promise.all([
      useAuthStore.getState().initializeAuth(),
      useThemeStore.getState().hydrateTheme(),
      useLanguageStore.getState().hydrateLanguage(),
    ]).finally(() => SplashScreen.hideAsync());
  }, [fontsReady]);

  // The auth gate: a session goes to the tabs; without one, a first launch
  // picks a language, then everything else lands on sign-in.
  useEffect(() => {
    if (!ready) return;
    const first = segments[0] as string | undefined;
    const onAuthRoute = !!first && AUTH_ROUTES.includes(first);

    if (token) {
      if (!first || onAuthRoute) router.replace("/(tabs)");
      return;
    }
    if (!language) {
      if (first !== "select-language") router.replace("/select-language");
      return;
    }
    if (!onAuthRoute || first === "select-language") router.replace("/login");
  }, [ready, token, language, segments]);

  // A signed-out device must not keep the previous outlet's orders in memory.
  useEffect(() => {
    if (!token) queryClient.clear();
  }, [token]);

  if (!fontsReady) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <ToastProvider>
                <RootLayoutNav />
                <GlobalSocketHandler />
                <PushNotificationHandler />
                <NewOrderBanner />
                <ScheduledRequestSheet />
                <AppAlert />
              </ToastProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
