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
import { Stack, router, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Platform, StyleSheet, Text, TextInput } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useDriverStore } from "@/store/driverStore";
import { LocationHandler } from "@/components/LocationHandler";
import { GlobalSocketHandler } from "@/components/GlobalSocketHandler";
import UpdateModal from "@/components/UpdateModal";
import { registerForPushNotificationsAsync } from "../utils/notificationRegister";
import { navigateToNotificationTarget } from "@/utils/deepLink";
import { typography, fontFamilies } from "@/constants/typography";
import { ToastProvider } from "@/components/ui/Toast";
import "@/utils/networkLogger";

SplashScreen.preventAutoHideAsync();

// --- Global Typography Patch (mirrors app/app/_layout.tsx) ---
// Normalizes ad-hoc fontSize values onto the shared typography scale and
// routes font family by role: Familjen Grotesk for heading-sized text
// (fontSize >= 18), Figtree for everything else.
const patchComponentStyle = (Component: any) => {
  const originalRender = Component.render;
  if (!originalRender) return;

  const familyFor = (isHeading: boolean, weight: any) => {
    const set = isHeading ? fontFamilies.heading : fontFamilies.body;
    if (weight === "800" || weight === "900" || weight === "bold" || weight === "700") return set.bold;
    if (weight === "600") return set.semibold;
    if (weight === "500") return set.medium;
    return set.regular;
  };

  Component.render = function (props: any, ref: any) {
    if (props && props.style) {
      const flat = StyleSheet.flatten(props.style);
      const updated = { ...flat };
      let isHeading = false;

      if (typeof flat.fontSize === "number") {
        const size = flat.fontSize;
        if (size >= 24) {
          updated.fontSize = typography.heading1.fontSize;
          if (flat.fontWeight === undefined || flat.fontWeight === "700" || flat.fontWeight === "800" || flat.fontWeight === "900" || flat.fontWeight === "bold") {
            updated.fontWeight = typography.heading1.fontWeight;
          }
          isHeading = true;
        } else if (size >= 18) {
          updated.fontSize = typography.heading2.fontSize;
          if (flat.fontWeight === undefined || flat.fontWeight === "700" || flat.fontWeight === "800" || flat.fontWeight === "bold") {
            updated.fontWeight = typography.heading2.fontWeight;
          }
          isHeading = true;
        } else if (size >= 15) {
          updated.fontSize = typography.sizes.bodyLarge;
        } else if (size >= 13) {
          updated.fontSize = typography.body.fontSize;
        } else if (size >= 11) {
          updated.fontSize = typography.bodySecondary.fontSize;
        } else {
          updated.fontSize = typography.sizes.caption;
        }
      }

      updated.fontFamily = familyFor(isHeading, updated.fontWeight ?? flat.fontWeight);
      props = { ...props, style: updated };
    } else {
      props = { ...props, style: { fontFamily: fontFamilies.body.regular } };
    }
    return originalRender.call(this, props, ref);
  };
};

patchComponentStyle(Text);
patchComponentStyle(TextInput);
// -------------------------------

const queryClient = new QueryClient();

function RootLayoutNav() {
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

  // Register push notifications when authenticated, and listen for tokens & taps (Priority 3 & 4)
  useEffect(() => {
    if (!token) return;

    const isExpoGo =
      Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
      (Constants as any).appOwnership === "expo";

    if (isExpoGo) {
      console.log("[PushNotifications] Push notifications disabled in Expo Go SDK 53+. Use a development build.");
      return;
    }

    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl;

      // 1. Initial Registration
      registerForPushNotificationsAsync(token).catch((err: any) => {
        console.error("Error registering push notifications:", err);
      });

      // 2. Token Refresh Listener (Priority 3)
      const tokenSubscription = Notifications.addPushTokenListener(async (tokenData: any) => {
        console.log("[PushNotifications] Token refreshed (Driver):", tokenData.data);
        try {
          const response = await fetch(`${apiUrl}/users/push-token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ expoPushToken: tokenData.data }),
          });
          if (response.ok) {
            console.log("[PushNotifications] Refreshed token updated on backend successfully (Driver)!");
          } else {
            console.error("[PushNotifications] Failed to sync refreshed token on backend (Driver):", await response.text());
          }
        } catch (err) {
          console.error("[PushNotifications] Failed to sync refreshed token on backend (Driver):", err);
        }
      });

      // 3. Notification Tap / Response Listener — app was already running (foreground/background)
      const responseSubscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
        const data = response.notification.request.content.data;
        console.log("[PushNotifications] Notification tapped (Driver). Payload data:", data);
        navigateToNotificationTarget(data);
      });

      // 4. Cold-start check — app was fully killed and got opened BY tapping a notification.
      // addNotificationResponseReceivedListener above never fires for this case.
      Notifications.getLastNotificationResponseAsync().then((response: any) => {
        if (!response) return;
        const data = response.notification.request.content.data;
        console.log("[PushNotifications] Cold-started from notification (Driver). Payload data:", data);
        navigateToNotificationTarget(data);
      });

      return () => {
        tokenSubscription?.remove();
        responseSubscription?.remove();
      };
    } catch (err) {
      console.warn("[PushNotifications] Error setting up notifications:", err);
    }
  }, [token]);

  if (!hydrated) {
    return null; // Or a custom Loading/Splash view
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="auth" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="identity-verify" options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="zone-map" options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

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

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    // Check version on launch
    (async () => {
      try {
        const platform = Platform.OS === "ios" ? "ios" : "android";
        const currentVersion = Constants.expoConfig?.version || "1.0.0";
        const apiUri = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api/v1";
        const res = await fetch(`${apiUri}/auth/version-check?platform=${platform}&version=${currentVersion}`);
        if (!res.ok) return;
        const result = await res.json();
        if (result.updateRequired) {
          const latest = result.latest || "1.0.0";
          setLatestVersion(latest);
          setStoreUrl(result.url || (platform === "ios" ? "https://apps.apple.com" : "https://play.google.com"));
          setForceUpdate(result.forceUpdate);
          
          if (result.forceUpdate) {
            setShowUpdate(true);
          } else {
            const dismissedVersion = await AsyncStorage.getItem("dismissed_update_version");
            if (dismissedVersion !== latest) {
              setShowUpdate(true);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to check app updates:", err);
      }
    })();
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <ToastProvider>
                <RootLayoutNav />
                <LocationHandler />
                <GlobalSocketHandler />
                <UpdateModal
                  visible={showUpdate}
                  forceUpdate={forceUpdate}
                  storeUrl={storeUrl}
                  onDismiss={handleDismissUpdate}
                />
              </ToastProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
