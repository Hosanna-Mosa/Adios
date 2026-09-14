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
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { Platform, View, Modal, TouchableOpacity, Image, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as NavigationBar from "expo-navigation-bar";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuthStore } from "@/contexts/authStore";
import { setAuthTokenGetter, setBaseUrl, setUnauthorizedHandler } from "@/utils/api/custom-fetch";
import { navigateToNotificationTarget } from "@/utils/deepLink";

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

// The API answers 401 — and only 401 — for a missing, expired or revoked token.
// handleUnauthorized clears the session and returns true only for the first of
// a burst of parallel 401s, so the sign-out and the redirect happen once.
setUnauthorizedHandler(() => {
  if (useAuthStore.getState().handleUnauthorized()) {
    router.replace("/login");
  }
});


import UpdateModal from "@/components/UpdateModal";
import CartConflictDialog from "@/components/CartConflictDialog";
import { OfflineBanner } from "@/components/OfflineBanner";
import { useState } from "react";
import { GlobalSocketHandler } from "@/components/GlobalSocketHandler";
import { ToastProvider } from "@/components/ui/Toast";
import Colors from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useLanguageStore } from "@/contexts/languageStore";
import "@/i18n";
import { typography, fontFamilies } from "@/constants/typography";
import { TextInput } from "react-native";

// --- Global Typography Patch ---
// Sizes are NOT touched here any more: every fontSize in the codebase is one of
// the four tokens in constants/typography.ts, so there is nothing left to snap.
// (The old version bucketed already-scaled numbers, which made the same
// declaration render at different sizes depending on screen width.)
//
// What remains is the font-family pairing: static font files mean each weight is
// its own family, so the family has to be derived from the weight at render time.
const patchComponentStyle = (Component: any) => {
  const originalRender = Component.render;
  if (!originalRender) return;

  // Picks the weight-matched family variant for a text role — heading sizes get
  // Familjen Grotesk, everything else Figtree, per constants/typography.ts.
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

      // "Heading" is an identity check against the very token the style used, so
      // it gives the same answer on every device width — no thresholds involved.
      const isHeading =
        flat.fontSize === typography.sizes.large || flat.fontSize === typography.sizes.extraLarge;

      // Keep the weights the old buckets forced, so headings look unchanged:
      // extraLarge was heading1 (600), large was heading2 (700).
      if (flat.fontSize === typography.sizes.extraLarge) {
        if (flat.fontWeight === undefined || flat.fontWeight === "700" || flat.fontWeight === "800" || flat.fontWeight === "900" || flat.fontWeight === "bold") {
          updated.fontWeight = "600";
        }
      } else if (flat.fontSize === typography.sizes.large) {
        if (flat.fontWeight === undefined || flat.fontWeight === "700" || flat.fontWeight === "800" || flat.fontWeight === "bold") {
          updated.fontWeight = "700";
        }
      }

      updated.fontFamily = familyFor(isHeading, updated.fontWeight ?? flat.fontWeight);

      props = {
        ...props,
        style: updated,
      };
    } else {
      // No style at all: default to regular Figtree (body is the common case).
      props = {
        ...props,
        style: { fontFamily: fontFamilies.body.regular },
      };
    }
    return originalRender.call(this, props, ref);
  };
};

import { StyleSheet } from "react-native";
patchComponentStyle(Text);
patchComponentStyle(TextInput);
// -------------------------------

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const insets = useSafeAreaInsets();
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const { theme } = useThemeStore();
  const colors = Colors[theme];

  if (!isInitialized) {
    return null; // Or a custom Loading/Splash view
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Content colour, not a bar colour: edge-to-edge leaves the background to
          the screen underneath. Follows the theme so the icons never match the
          ground they sit on. */}
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        <Stack.Screen name="index" options={{ animation: "fade" }} />
        <Stack.Screen name="login" options={{ animation: "fade" }} />
        <Stack.Screen name="otp" />
        <Stack.Screen name="signup" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
        <Stack.Screen name="delivery/entry" />
        <Stack.Screen name="delivery/add-stop" />
        <Stack.Screen name="delivery/checkout" />
        <Stack.Screen name="cart" options={{ animation: "slide_from_bottom" }} />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="payment" />
        <Stack.Screen name="tracking" />
        <Stack.Screen name="pickup-confirmation" />
        <Stack.Screen name="ride-searching" />
        <Stack.Screen name="restaurant-menu" />
        <Stack.Screen name="restaurant-details" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="149-store" />
      </Stack>
      {Platform.OS === "android" && insets.bottom > 0 && (
        <View style={{ height: insets.bottom, backgroundColor: colors.background }} />
      )}
    </View>
  );
}

export default function RootLayout() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [storeUrl, setStoreUrl] = useState("");
  const [latestVersion, setLatestVersion] = useState("");

  const handleDismissUpdate = async () => {
    try {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      if (latestVersion) {
        await AsyncStorage.setItem("dismissed_update_version", latestVersion);
      }
    } catch (err) {
      console.warn("Failed to save dismissed version:", err);
    }
    setShowUpdate(false);
  };

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setButtonStyleAsync("dark");
    }

    // Call version-check API on app launch
    (async () => {
      try {
        const platform = Platform.OS === "ios" ? "ios" : "android";
        const currentVersion = versionOverride || Constants.expoConfig?.version || "1.0.0";
        if (versionOverride) {
          console.warn(
            `[VersionGate] SIMULATING app version ${versionOverride} (EXPO_PUBLIC_VERSION_OVERRIDE) — not the real build version`
          );
        }
        const res = await fetch(`${apiUrl}/auth/version-check?platform=${platform}&version=${currentVersion}`);
        if (!res.ok) {
          console.warn(`[VersionGate] version-check failed: HTTP ${res.status} for ${apiUrl}/auth/version-check`);
          return;
        }
        const result = await res.json();
        console.log(`[VersionGate] platform=${platform} version=${currentVersion} ->`, result);
        if (result.updateRequired) {
          const latest = result.latest || "1.0.0";
          setLatestVersion(latest);
          setStoreUrl(result.url || (platform === "ios" ? "https://apps.apple.com" : "https://play.google.com"));
          setForceUpdate(result.forceUpdate);

          if (result.forceUpdate) {
            setShowUpdate(true);
          } else if (versionOverride) {
            // While simulating a version, the prompt must come back on every
            // launch so the dismissible band stays re-testable.
            setShowUpdate(true);
          } else {
            // Check if this version was already dismissed
            const AsyncStorage = require("@react-native-async-storage/async-storage").default;
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
  const language = useLanguageStore((s) => s.language);
  const segments = useSegments();

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
  // language selection first, then the existing token-based auth gate.
  useEffect(() => {
    if (!(fontsLoaded || fontError) || !isInitialized) return;

    const firstSegment = segments[0];

    // Language gate — takes priority over the auth gate, so a user reads the
    // login screen itself in their chosen language.
    if (!language) {
      if (firstSegment !== "select-language") {
        router.replace("/select-language");
      }
      return;
    }

    const isAuthScreen = !firstSegment || firstSegment === "login" || firstSegment === "signup" || firstSegment === "otp";

    if (!token && !isAuthScreen) {
      router.replace("/login");
      return;
    }

    if (token && isAuthScreen) {
      // Token exists → go straight to the main app
      router.replace("/(tabs)");
    }
  }, [isInitialized, token, fontsLoaded, fontError, segments, language]);

  // Register push notifications when authenticated, and listen for tokens & taps (Priority 3 & 4)
  useEffect(() => {
    if (!token || Platform.OS === "web") return;

    const { registerForPushNotificationsAsync } = require("@/utils/notificationRegister");
    const { customFetch } = require("@/utils/api/custom-fetch");

    // 1. Initial Registration
    registerForPushNotificationsAsync().catch((err: any) => {
      console.error("Error registering push notifications:", err);
    });

    // 2. Token Refresh Listener (Priority 3)
    const tokenSubscription = Notifications.addPushTokenListener(async (tokenData) => {
      console.log("[PushNotifications] Token refreshed:", tokenData.data);
      try {
        await customFetch("/users/push-token", {
          method: "POST",
          body: JSON.stringify({ expoPushToken: tokenData.data }),
        });
        console.log("[PushNotifications] Refreshed token updated on backend successfully!");
      } catch (err) {
        console.error("[PushNotifications] Failed to sync refreshed token on backend:", err);
      }
    });

    // 3. Notification Tap / Response Listener — app was already running (foreground/background)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      console.log("[PushNotifications] Notification tapped. Payload data:", data);
      navigateToNotificationTarget(data);
    });

    // 4. Cold-start check — app was fully killed and got opened BY tapping a notification.
    // addNotificationResponseReceivedListener above never fires for this case.
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      const data = response.notification.request.content.data;
      console.log("[PushNotifications] Cold-started from notification. Payload data:", data);
      navigateToNotificationTarget(data);
    });

    return () => {
      tokenSubscription.remove();
      responseSubscription.remove();
    };
  }, [token]);

  if (!fontsLoaded && !fontError) return null;

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
              </ToastProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
