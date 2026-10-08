import { Alert, Linking } from "react-native";

import i18n from "@/i18n";

/** A number that can actually be dialed — not empty, and not a display
 * placeholder such as the "N/A" the order mapper stores for a missing phone. */
export function isDialable(phone?: string | null): phone is string {
  return (phone?.replace(/\D/g, "").length ?? 0) >= 6;
}

/**
 * Calls `phone`, or tells the driver there's no number. The job stages used to
 * dial a made-up "1234567890" whenever the customer's or restaurant's phone
 * was missing; this matches the chat screen's "No phone number" alert instead.
 */
export function callPhone(phone: string | null | undefined, whose: "customer" | "restaurant") {
  if (!isDialable(phone)) {
    Alert.alert(
      i18n.t("jobs.noPhoneNumber"),
      whose === "customer"
        ? i18n.t("jobs.customerPhoneNotAvailable")
        : i18n.t("jobs.restaurantPhoneNotAvailable"),
    );
    return;
  }
  Linking.openURL(`tel:${phone}`);
}
