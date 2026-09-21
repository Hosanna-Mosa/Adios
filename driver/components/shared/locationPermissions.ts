import * as Location from "expo-location";
import * as Notifications from "expo-notifications";

/** Ask for notifications, then foreground location.
 *
 * Returns whether foreground location was granted — the caller cannot track
 * without it. Notifications are requested at the same time because the driver
 * needs both to receive and act on jobs, but a refusal there is not fatal. */
export async function requestTrackingPermissions(): Promise<{
  foregroundGranted: boolean;
  notificationsGranted: boolean;
}> {
  const { status: notifCheck } = await Notifications.getPermissionsAsync();
  let notifStatus = notifCheck;
  if (notifStatus !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    notifStatus = requested.status;
  }

  const { status: fgCheck } = await Location.getForegroundPermissionsAsync();
  let fgStatus = fgCheck;
  if (fgStatus !== "granted") {
    const requested = await Location.requestForegroundPermissionsAsync();
    fgStatus = requested.status;
  }

  return {
    foregroundGranted: fgStatus === "granted",
    notificationsGranted: notifStatus === "granted",
  };
}
