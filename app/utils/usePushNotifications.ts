import { useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { customFetch } from "@/utils/api/custom-fetch";
import { navigateToNotificationTarget } from "@/utils/deepLink";

// Push registration plus the token and tap listeners. Split out of
// app/_layout.tsx unchanged — same [token] dependency, same cleanup, and the
// cold-start tap is still replayed via getLastNotificationResponseAsync.

export function usePushNotifications(token: string | null) {

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
}
