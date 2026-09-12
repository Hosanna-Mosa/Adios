import { useEffect } from "react";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "@/utils/notificationRegister";
import { navigateToNotificationTarget } from "@/utils/deepLink";
import { API_URL } from "@/utils/apiUrl";

/** Registers for push, keeps the token in sync, and routes notification taps —
 * including the cold-start case where the app was opened by tapping one.
 *
 * No-op in Expo Go, where SDK 53 removed remote push on Android. */
export function usePushNotifications(token: string | null) {
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

      // 1. Initial Registration
      registerForPushNotificationsAsync(token).catch((err: any) => {
        console.error("Error registering push notifications:", err);
      });

      // 2. Token Refresh Listener (Priority 3)
      const tokenSubscription = Notifications.addPushTokenListener(async (tokenData: any) => {
        console.log("[PushNotifications] Token refreshed (Driver):", tokenData.data);
        try {
          const response = await fetch(`${API_URL}/users/push-token`, {
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
}
