import { Linking } from "react-native";
import * as Location from "expo-location";
import i18n from "@/i18n";
import { showAlert } from "@/components/ui/AppAlert";

/**
 * Tells the customer a permission is off and how to fix it. Once the OS has
 * stopped asking (iOS after one denial, Android after two), the only way back
 * is the app's page in system Settings, so the alert offers to open it.
 */
export function showOpenSettingsAlert(title: string, message: string) {
  showAlert(
    title,
    message,
    [
      { text: i18n.t("actions.cancel"), style: "cancel" },
      { text: i18n.t("app.permissions.openSettings"), onPress: () => { Linking.openSettings().catch(() => {}); } },
    ],
    "warning",
  );
}

/**
 * Asks for foreground location for something the customer just tapped. Returns
 * true when granted; otherwise shows the "open Settings" alert and returns false.
 * Don't use it for permission requests made on screen load — an alert nobody
 * asked for is worse than the silent fallback those screens already have.
 */
export async function requestLocationPermission(message?: string): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status === "granted") return true;
  showOpenSettingsAlert(
    i18n.t("app.permissions.locationTitle"),
    message ?? i18n.t("app.permissions.locationBody"),
  );
  return false;
}
