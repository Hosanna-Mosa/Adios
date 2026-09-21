import { useEffect } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as NavigationBar from "expo-navigation-bar";

// Android nav-bar styling plus the launch version check that decides whether
// the blocking update modal is shown. Split out of app/_layout.tsx unchanged.

interface Args {
  versionOverride?: string | null;
  apiUrl?: string;
  setShowUpdate: (v: boolean) => void;
  setForceUpdate: (v: boolean) => void;
  setStoreUrl: (v: string) => void;
  setLatestVersion: (v: string) => void;
}

export function useVersionGate({
  versionOverride, apiUrl, setShowUpdate, setForceUpdate, setStoreUrl, setLatestVersion,
}: Args) {
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
}
