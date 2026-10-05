import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import * as Notifications from "expo-notifications";
import { router, useSegments } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/contexts/authStore";
import { useLanguageStore } from "@/contexts/languageStore";
import { usePushStore } from "@/contexts/pushStore";
import { registerPushToken } from "@/services/outlet.service";
import { parsePushPayload, pushTarget } from "@/utils/pushPayload";
import { configureNotificationChannels, getPushTokenAsync, installForegroundHandler } from "@/utils/pushNotifications";
import { alertNewOrder, alertScheduledRequest } from "./liveAlerts";

// Order alerts for when the partner isn't looking at the app. Mounted once at
// the root next to GlobalSocketHandler: it registers this device for the
// signed-in outlet's pushes, turns a push received while the app is open into
// the in-app alert, and opens the order (or scheduled requests) a tapped push
// is about.

installForegroundHandler();

const AUTH_ROUTES = ["login", "forgot-password", "select-language"];

export function PushNotificationHandler() {
  const token = useAuthStore((s) => s.token);
  const vendorId = useAuthStore((s) => s.partner?._id);
  const language = useLanguageStore((s) => s.language);
  const queryClient = useQueryClient();
  const segments = useSegments();
  const lastResponse = Notifications.useLastNotificationResponse();
  const handledResponse = useRef<string | null>(null);
  // Past the splash and the auth gate — a screen pushed earlier would be replaced by its redirect.
  const inApp = segments.length > 0 && !AUTH_ROUTES.includes(segments[0] as string);

  // Channel names show in Android's settings, so they follow the app's language.
  useEffect(() => {
    configureNotificationChannels().catch(() => {});
  }, [language]);

  // Register for the signed-in outlet; re-check whenever the app comes back to
  // the foreground, in case the partner has just turned notifications on in Settings.
  useEffect(() => {
    if (!token || !vendorId) return;
    let cancelled = false;
    const sync = async (ask: boolean) => {
      // Android 13+ only shows the permission prompt once a channel exists.
      await configureNotificationChannels().catch(() => {});
      const { permission, token: pushToken } = await getPushTokenAsync(ask);
      if (cancelled) return;
      usePushStore.getState().setPermission(permission);
      if (pushToken && pushToken !== usePushStore.getState().registeredToken) {
        await registerPushToken(pushToken);
        if (!cancelled) usePushStore.getState().setRegisteredToken(pushToken);
      }
    };
    sync(true).catch(() => {});
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") sync(false).catch(() => {});
    });
    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, [token, vendorId]);

  // A push that lands while the app is open becomes the in-app banner / sheet.
  useEffect(() => {
    if (!token || !vendorId) return;
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const payload = parsePushPayload(notification.request.content.data);
      if (payload?.kind === "new_order") {
        alertNewOrder(queryClient, vendorId, payload);
      } else if (payload?.kind === "scheduled_request" && payload.scheduledFor) {
        alertScheduledRequest(queryClient, vendorId, { ...payload, scheduledFor: payload.scheduledFor });
      }
    });
    return () => subscription.remove();
  }, [token, vendorId, queryClient]);

  // Tapping a push — including the one that launched the app — opens what it is about.
  useEffect(() => {
    if (!lastResponse || !token || !inApp) return;
    if (lastResponse.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const id = lastResponse.notification.request.identifier;
    if (handledResponse.current === id) return;
    handledResponse.current = id;
    const target = pushTarget(parsePushPayload(lastResponse.notification.request.content.data));
    if (target) router.push(target);
  }, [lastResponse, token, inApp]);

  return null;
}
