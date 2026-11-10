import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "@/i18n";

/**
 * Google Play's prominent-disclosure requirement for background location: before
 * the system "Allow all the time" prompt, the app must say in its own UI what it
 * collects, why, and that it does so while the app is closed — and the driver
 * must actively agree. Declining skips the system prompt; the driver is asked
 * again the next time they go online. Accepting is remembered on this device.
 */
const ACCEPTED_KEY = "bg_location_disclosure_accepted";

export async function confirmBackgroundLocationDisclosure(): Promise<boolean> {
  if ((await AsyncStorage.getItem(ACCEPTED_KEY).catch(() => null)) === "true") return true;

  const accepted = await new Promise<boolean>((resolve) => {
    Alert.alert(
      i18n.t("jobs.backgroundLocationDisclosureTitle"),
      i18n.t("jobs.backgroundLocationDisclosureBody"),
      [
        { text: i18n.t("jobs.backgroundLocationDisclosureDecline"), style: "cancel", onPress: () => resolve(false) },
        { text: i18n.t("jobs.backgroundLocationDisclosureAccept"), onPress: () => resolve(true) },
      ],
      // Dismissing by tapping outside (Android) counts as declining.
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });

  if (accepted) await AsyncStorage.setItem(ACCEPTED_KEY, "true").catch(() => {});
  return accepted;
}
