import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import i18n from "@/i18n";
import type { PushPermission } from "@/contexts/pushStore";
import { parsePushPayload } from "./pushPayload";

// Order alerts that reach the partner while the app is closed. The backend
// (services/notification.service.ts) sends order pushes to the ORDERS_CHANNEL
// channel with ORDER_SOUND, high priority; app.config.js bundles the sound.

export const ORDERS_CHANNEL = "orders";
const ORDER_SOUND = "new_order.wav";
const ALERT_VIBRATION = [0, 450, 180, 450];

/**
 * Android channels. A channel's sound and importance are fixed the first time
 * it is created, so these are deliberate: order alerts ring at maximum
 * importance, show on the lock screen and break through as heads-up alerts.
 */
export async function configureNotificationChannels() {
  if (Platform.OS !== "android") return;
  await Promise.all([
    Notifications.setNotificationChannelAsync(ORDERS_CHANNEL, {
      name: i18n.t("notifications.ordersChannel"),
      description: i18n.t("notifications.ordersChannelHint"),
      importance: Notifications.AndroidImportance.MAX,
      sound: ORDER_SOUND,
      vibrationPattern: ALERT_VIBRATION,
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    }),
    Notifications.setNotificationChannelAsync("default", {
      name: i18n.t("notifications.generalChannel"),
      importance: Notifications.AndroidImportance.DEFAULT,
    }),
  ]);
}

/**
 * How a push shows while the app is open. Order alerts are drawn in-app by the
 * new-order banner / scheduled-request sheet (which ring themselves), so their
 * system banner and sound are skipped; anything else shows as usual.
 */
export function installForegroundHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const shownInApp = parsePushPayload(notification.request.content.data) !== null;
      return { shouldShowBanner: !shownInApp, shouldShowList: true, shouldPlaySound: !shownInApp, shouldSetBadge: false };
    },
  });
}

const projectId = (): string | undefined =>
  (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId ?? Constants.easConfig?.projectId;

/**
 * This device's Expo push token, asking for permission first when `ask` (the
 * OS shows its prompt only while the partner hasn't decided yet).
 */
export async function getPushTokenAsync(ask: boolean): Promise<{ permission: PushPermission; token: string | null }> {
  if (Platform.OS === "web") return { permission: "unavailable", token: null };

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted" && ask) ({ status } = await Notifications.requestPermissionsAsync());
  if (status !== "granted") return { permission: status === "denied" ? "denied" : "unknown", token: null };

  const id = projectId();
  if (!id) {
    if (__DEV__) console.warn("[push] EAS_PROJECT_ID is not set — order alerts can't reach this device while the app is closed.");
    return { permission: "unavailable", token: null };
  }
  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId: id });
    return { permission: "granted", token: data };
  } catch (error) {
    // Simulators and devices without Google Play services have no push token.
    if (__DEV__) console.warn("[push] Could not get a push token", error);
    return { permission: "unavailable", token: null };
  }
}
