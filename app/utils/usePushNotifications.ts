import { useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { navigateToNotificationTarget } from "@/utils/deepLink";

// Push registration plus the token and tap listeners. Split out of
// app/_layout.tsx unchanged — same [token] dependency, same cleanup, and the
// cold-start tap is still replayed via getLastNotificationResponseAsync.

// On Android, every device-token fetch (including the one inside
// getExpoPushTokenAsync) also fires addPushTokenListener with that same token.
// So only a token different from the last one seen is a real refresh —
// re-registering on every event loops forever.
let lastDeviceToken: string | null = null;

export function usePushNotifications(token: string | null) {

  // Register push notifications when authenticated, and listen for tokens & taps (Priority 3 & 4)
  useEffect(() => {
    if (!token || Platform.OS === "web") return;

    const { registerForPushNotificationsAsync } = require("@/utils/notificationRegister");

    // 1. Initial Registration
    registerForPushNotificationsAsync().catch((err: any) => {
      console.error("Error registering push notifications:", err);
    });

    // 2. Token Refresh Listener (Priority 3)
    // This listener hands back the raw FCM/APNs device token, not an Expo push
    // token — posting it would overwrite the good Expo token on the backend. So
    // treat a changed token purely as a signal and re-fetch the Expo token.
    const tokenSubscription = Notifications.addPushTokenListener((tokenData) => {
      const isRefresh = lastDeviceToken !== null && tokenData.data !== lastDeviceToken;
      lastDeviceToken = tokenData.data;
      if (!isRefresh) return;
      registerForPushNotificationsAsync().catch((err: any) => {
        console.error("[PushNotifications] Failed to sync refreshed token on backend:", err);
      });
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
}
