import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import Colors from "@/constants/colors";

/**
 * Landing route for the DigiLocker deep link.
 *
 * After consent, the backend's callback page redirects the in-app browser to
 * `<scheme>://digilocker-callback`. Two things then happen at once:
 *
 *   1. expo-web-browser intercepts that URL, closes the browser and resolves
 *      the promise `digilocker-verify` is awaiting — this is what actually
 *      drives the flow.
 *   2. Expo Router *also* receives the URL and navigates here.
 *
 * Without this file (2) lands on a route that does not exist, and the root
 * layout's onboarding guard bounces the driver to /onboarding, restarting it
 * at step 1 — which is exactly the bug this screen exists to prevent.
 *
 * So this screen deliberately does nothing but get out of the way. The
 * verification screen underneath is still mounted and still handling the
 * result, so popping back to it resumes the flow exactly where it was.
 */
export default function DigiLockerCallbackScreen() {
  useEffect(() => {
    // Defer by a tick so the navigator has finished mounting this screen
    // before we pop it — popping mid-mount is a no-op on some platforms.
    const timer = setTimeout(() => {
      if (router.canGoBack()) {
        router.back();
      } else {
        // Cold start: the app was not running when the link arrived, so there
        // is nothing to go back to. Send the driver to the verification screen,
        // which re-checks status on mount and will find the completed link.
        router.replace("/digilocker-verify");
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
});
