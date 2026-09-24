// Load-bearing import order: the typography patch replaces react-native's
// Text/TextInput accessors, so it must run before any module that renders text.
import "@/utils/typographyPatch";

import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { LocationHandler } from "@/components/shared/LocationHandler";
import { GlobalSocketHandler } from "@/components/shared/GlobalSocketHandler";
import UpdateModal from "@/components/shared/UpdateModal";
import { ToastProvider } from "@/components/ui/Toast";
import "@/utils/networkLogger";
import "@/i18n";
import { useLanguageStore } from "@/store/languageStore";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useAppFonts } from "@/hooks/useAppFonts";
import { useVersionCheck } from "@/hooks/useVersionCheck";
import { useAuthGate } from "@/hooks/useAuthGate";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { hydrated, token } = useAuthGate();
  usePushNotifications(token);

  if (!hydrated) {
    return null; // Or a custom Loading/Splash view
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="select-language" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="language-settings" options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="auth" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="digilocker-verify" options={{ headerShown: false }} />
      <Stack.Screen name="digilocker-callback" options={{ headerShown: false, animation: "none" }} />
      <Stack.Screen name="identity-verify" options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="zone-map" options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const { showUpdate, forceUpdate, storeUrl, handleDismissUpdate } = useVersionCheck();
  const fontsReady = useAppFonts();

  useEffect(() => {
    useLanguageStore.getState().hydrateLanguage();
  }, []);

  if (!fontsReady) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
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
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
