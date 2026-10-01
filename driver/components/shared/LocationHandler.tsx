import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { useTranslation } from "react-i18next";
import { useDriverStore } from "@/store/driverStore";
import { useLocationTracking } from "./useLocationTracking";
import { BACKGROUND_LOCATION_TASK } from "./backgroundLocationTask";

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

      // Only a real background counts. "inactive" is a transient state — a
      // permission dialog, the notification shade, the app switcher, any native
      // picker — and treating it as backgrounding is what kept knocking drivers
      // off shift just for opening another screen.
      if (appState.current === "active" && nextAppState === "background") {
        if (isCheckingPermissions.current) {
          console.log("[LocationHandler] Background caused by a permission check. Staying online.");
          appState.current = nextAppState;
          return;
        }

        const store = useDriverStore.getState();
        if (!store.isOnline) {
          appState.current = nextAppState;
          return;
        }

        // Background location updates keep the driver dispatchable while
        // minimised, so there is no reason to end their shift. Without them the
        // dispatcher would be sending orders nobody can see, so that case does
        // still go offline.
        const trackingInBackground = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK).catch(() => false);
        if (trackingInBackground) {
          console.log("[LocationHandler] App minimised; background tracking is running, staying online.");
        } else {
          console.log("[LocationHandler] App minimised with no background tracking. Going offline.");
          store.goOffline();

          Notifications.scheduleNotificationAsync({
            content: {
              title: t("jobs.statusOffline"),
              body: t("jobs.backgroundLocationOffNowOffline"),
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
