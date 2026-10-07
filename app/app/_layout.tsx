import { useFonts } from "expo-font";
import {
  FamiljenGrotesk_400Regular,
  FamiljenGrotesk_500Medium,
  FamiljenGrotesk_600SemiBold,
  FamiljenGrotesk_700Bold,
} from "@expo-google-fonts/familjen-grotesk";
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from "@expo-google-fonts/figtree";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuthStore } from "@/contexts/authStore";
import { useIntroSplashStore } from "@/contexts/introSplashStore";
import { useLanguageStore } from "@/contexts/languageStore";
import "@/i18n";
// Side-effect import: patches Text/TextInput to pair a weight with its font file.
import "@/constants/applyFontPatch";
// Side-effect import: subscribes the cart to the signed-in account. It used to
// live at the bottom of cartStore.ts; it is loaded here so the subscription is
// still established exactly once, at app start, without a store<->sync cycle.
import "@/contexts/cart.ownerSync";
import { setAuthTokenGetter, setBaseUrl, setUnauthorizedHandler } from "@/utils/api/custom-fetch";
import { usePushNotifications } from "@/utils/usePushNotifications";
import { useAnalytics } from "@/utils/useAnalytics";
import { configureAnalytics } from "@/utils/analytics";
import { RootLayoutNav } from "@/components/RootLayoutNav";
import { useVersionGate } from "@/utils/useVersionGate";
import UpdateModal from "@/components/UpdateModal";
import CartConflictDialog from "@/components/CartConflictDialog";
import { OfflineBanner } from "@/components/OfflineBanner";
import { GlobalSocketHandler } from "@/components/GlobalSocketHandler";
import { AppAlert } from "@/components/ui/AppAlert";
import { ToastProvider } from "@/components/ui/Toast";
import { useThemeStore } from "@/contexts/themeStore";
import { designTokens } from "@/constants/colors";

// The API URL should be retrieved from environment variables or app config
const apiUrl = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl;
console.log("[DEBUG] API URL:", apiUrl);

// QA knob: makes the update gate report this version instead of the built one,
// so every band can be exercised without building an old APK. Inlined by Metro
// at bundle time — see .env.example. Unset in real builds.
const versionOverride = process.env.EXPO_PUBLIC_VERSION_OVERRIDE?.trim();

if (apiUrl) {
  setBaseUrl(apiUrl);
}

// Register token getter for automated Authorization headers
setAuthTokenGetter(() => {
  return useAuthStore.getState().token;
});

// Live copy of analytics events for the admin Live Activity page (Firebase
// keeps getting them too). Signed-out events are sent without a token.
if (apiUrl) {
  configureAnalytics({ apiUrl, app: "customer", getToken: () => useAuthStore.getState().token });
}

// The API answers 401 — and only 401 — for a missing, expired or revoked token.
// handleUnauthorized clears the session and returns true only for the first of
// a burst of parallel 401s, so the sign-out and the redirect happen once.
setUnauthorizedHandler(() => {
  if (useAuthStore.getState().handleUnauthorized()) {
    router.replace("/login");
  }
});




SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();


export default function RootLayout() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [storeUrl, setStoreUrl] = useState("");
  const [latestVersion, setLatestVersion] = useState("");

  const handleDismissUpdate = async () => {
    try {
      if (latestVersion) {
        await AsyncStorage.setItem("dismissed_update_version", latestVersion);
      }
    } catch (err) {
      console.warn("Failed to save dismissed version:", err);
    }
    setShowUpdate(false);
  };

  useVersionGate({ versionOverride, apiUrl, setShowUpdate, setForceUpdate, setStoreUrl, setLatestVersion });


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

  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const token = useAuthStore((s) => s.token);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const languageConfirmed = useLanguageStore((s) => s.languageConfirmed);
  const introSplashDone = useIntroSplashStore((s) => s.introSplashDone);
  const segments = useSegments();
  const brandColor = designTokens[useThemeStore((s) => s.theme)].brand;

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Initialize auth, restore the saved theme, and restore the saved
      // language (all three read AsyncStorage), then hide splash — resolving
      // these first keeps the app from flashing light/English before settling
      // on the user's saved choices.
      Promise.all([
        initializeAuth(),
        useThemeStore.getState().hydrateTheme(),
        useLanguageStore.getState().hydrateLanguage(),
      ]).then(() => {
        SplashScreen.hideAsync();
      });
    }
  }, [fontsLoaded, fontError]);

  // Once auth/language are initialized and fonts are ready, redirect based on
  // a restored session first, then the language gate, then the rest of the
  // auth flow. Waits for the existing brand-coloured "ADIOS" splash inside
  // app/index.tsx to finish first, so app/index.tsx is never replaced
  // mid-animation — see contexts/introSplashStore.ts.
  useEffect(() => {
    if (!(fontsLoaded || fontError) || !isInitialized || !introSplashDone) return;

    const firstSegment = segments[0];
    const isAuthScreen = !firstSegment || firstSegment === "login" || firstSegment === "signup" || firstSegment === "otp";

    // A restored session always wins — an authenticated user goes straight to
    // the main app and never sees the language gate again this process.
    if (token) {
      if (isAuthScreen) {
        router.replace("/(tabs)");
      }
      return;
    }

    // Unauthenticated: the language gate takes priority over the rest of the
    // auth flow, so Login (and every other auth screen) is read in the
    // user's chosen language. `languageConfirmed` is in-memory only — reset
    // on every cold start and after sign-out — so a *persisted* language
    // choice can pre-select an option on that screen without ever letting it
    // be skipped outright.
    if (!languageConfirmed) {
      if (firstSegment !== "select-language") {
        router.replace("/select-language");
      }
      return;
    }


    if (!isAuthScreen) {
      router.replace("/login");
    }
  }, [isInitialized, token, fontsLoaded, fontError, segments, languageConfirmed, introSplashDone]);
  usePushNotifications(token);
  useAnalytics();


  // Brand colour rather than nothing: same ground as the native splash and the
  // JS intro splash, so there is never a white frame between them.
  if (!fontsLoaded && !fontError) return <View style={{ flex: 1, backgroundColor: brandColor }} />;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <ToastProvider>
                <RootLayoutNav />
                <GlobalSocketHandler />
                <OfflineBanner />
                <UpdateModal
                  visible={showUpdate}
                  forceUpdate={forceUpdate}
                  storeUrl={storeUrl}
                  onDismiss={handleDismissUpdate}
                />
                <CartConflictDialog />
                <AppAlert />
              </ToastProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
