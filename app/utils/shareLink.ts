import { Share } from "react-native";
import Constants from "expo-constants";
import { showAlert } from "@/components/ui/AppAlert";
import i18n from "@/i18n";

// Where a shared link points. EXPO_PUBLIC_WEB_URL wins; otherwise the host the
// app registers for App/Universal Links (app.config.js `extra.webUrl`), which the
// backend answers at /restaurant-menu/:id — see backend share-landing.controller.ts.
// Sharing used to bail out silently whenever EXPO_PUBLIC_WEB_URL was unset, which
// is why the share button on a dish appeared to do nothing at all.
const WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL || Constants.expoConfig?.extra?.webUrl || "")
  .trim()
  .replace(/\/$/, "");

export function restaurantShareUrl(vendorId: string, itemId?: string) {
  if (!WEB_URL) return "";
  const base = `${WEB_URL}/restaurant-menu/${encodeURIComponent(vendorId)}`;
  return itemId ? `${base}?item=${encodeURIComponent(itemId)}` : base;
}

/**
 * Shares a restaurant, optionally highlighting one dish, as a link that works for
 * anyone: no app installed → the web preview page; app installed and App Links
 * verified (app.config.js `associatedDomains` / `intentFilters`, which still need
 * a real Apple Team ID and Android signing SHA256) → straight into the app.
 */
export async function shareRestaurant(vendorId: string, name: string, itemId?: string, itemName?: string) {
  const url = restaurantShareUrl(vendorId, itemId);
  if (!url) {
    console.warn("[shareLink] No web URL configured — set EXPO_PUBLIC_WEB_URL or extra.webUrl.");
    showAlert(i18n.t("app.shareLink.cantShareRightNow"), i18n.t("app.shareLink.sharingIsntConfigured"));
    return;
  }

  const message = itemId
    ? i18n.t("app.shareLink.checkOutItemAtVendor", { item: itemName || i18n.t("app.shareLink.thisDish"), name, url })
    : i18n.t("app.shareLink.checkOutVendor", { name, url });

  try {
    await Share.share({ message, url });
  } catch (err) {
    console.error("[shareLink] Share failed:", err);
    showAlert(i18n.t("app.shareLink.couldntShare"), i18n.t("app.shareLink.shareSheetDidntOpen"));
  }
}
