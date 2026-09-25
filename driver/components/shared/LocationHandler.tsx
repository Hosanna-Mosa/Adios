import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import * as Notifications from "expo-notifications";
import { useTranslation } from "react-i18next";
import { useDriverStore } from "@/store/driverStore";
import { useLocationTracking } from "./useLocationTracking";

export const LocationHandler = () => {
  const { t } = useTranslation();
  const { isOnline, driverPhone, driverUserId, currentOrder } = useDriverStore();
  const appState = useRef(AppState.currentState);
  const isCheckingPermissions = useRef(false);

  useLocationTracking({
    isOnline,
    driverPhone,
    driverUserId,
    currentOrder,
    isCheckingPermissions,
  });

  // AppState Listener to reconnect socket & refresh when app returns to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextAppState: AppStateStatus) => {
      // If returning to active, just log it. (We don't auto-reconnect because they are set offline below)
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("[LocationHandler] App resumed from background to foreground.");
      }

      // If going to background, force offline to sync state
      if (
        appState.current === "active" &&
        nextAppState.match(/inactive|background/)
      ) {
        // Skip if going to background due to a permission check popup
        if (isCheckingPermissions.current) {
          console.log("[LocationHandler] App went to background/inactive due to permission check. Skipping auto-offline.");
          appState.current = nextAppState;
          return;
        }

        console.log("[LocationHandler] App went to background. Forcing offline.");
        const store = useDriverStore.getState();
        if (store.isOnline) {
          store.goOffline();
          
          Notifications.scheduleNotificationAsync({
            content: {
              title: t("jobs.statusOffline"),
              body: t("jobs.yourAppIsMinimizedSoYouAreNowOffline"),
              sound: true,
            },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 },
          });
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [t]);


  return null;
};
