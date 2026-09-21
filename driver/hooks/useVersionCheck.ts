import { useEffect, useState } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/utils/apiUrl";

const DISMISSED_KEY = "dismissed_update_version";

/** Asks the backend whether this build is still supported.
 *
 * A forced update always shows; an optional one is hidden again once the
 * driver has dismissed that specific version. */
export function useVersionCheck() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [storeUrl, setStoreUrl] = useState("");
  const [latestVersion, setLatestVersion] = useState("");

  const handleDismissUpdate = async () => {
    try {
      if (latestVersion) {
        await AsyncStorage.setItem(DISMISSED_KEY, latestVersion);
      }
    } catch (err) {
      console.warn("Failed to save dismissed version:", err);
    }
    setShowUpdate(false);
  };

  useEffect(() => {
    (async () => {
      try {
        const platform = Platform.OS === "ios" ? "ios" : "android";
        // QA knob. Expo Go always reports the app.config.js version, which the
        // backend force-gates on iOS, putting the update modal over every
        // screen and making the app impossible to review. Unset in real
        // builds, so this is inert in production.
        const currentVersion =
          process.env.EXPO_PUBLIC_VERSION_OVERRIDE ||
          Constants.expoConfig?.version ||
          "1.0.0";
        const res = await fetch(
          `${API_URL}/auth/version-check?platform=${platform}&version=${currentVersion}`,
        );
        if (!res.ok) return;
        const result = await res.json();
        if (!result.updateRequired) return;

        const latest = result.latest || "1.0.0";
        setLatestVersion(latest);
        setStoreUrl(
          result.url ||
            (platform === "ios" ? "https://apps.apple.com" : "https://play.google.com"),
        );
        setForceUpdate(result.forceUpdate);

        if (result.forceUpdate) {
          setShowUpdate(true);
        } else {
          const dismissedVersion = await AsyncStorage.getItem(DISMISSED_KEY);
          if (dismissedVersion !== latest) setShowUpdate(true);
        }
      } catch (err) {
        console.warn("Failed to check app updates:", err);
      }
    })();
  }, []);

  return { showUpdate, forceUpdate, storeUrl, handleDismissUpdate };
}
