import { Linking } from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";

/**
 * Opens a banner/ad `targetUrl`.
 *
 * - "/offers", "/149-store", … → in-app route via router.push.
 * - https://… → Linking.openURL, so Android/iOS app links hand it to the
 *   matching native app when it is installed (e.g. a store's own app), and
 *   the browser otherwise.
 * - Anything else Linking can handle (tel:, mailto:, custom schemes) is
 *   passed through as-is.
 *
 * Never throws: a link that cannot be opened falls back to the in-app
 * browser for web URLs and is otherwise ignored.
 */
export async function openLink(rawUrl?: string | null): Promise<void> {
  const url = rawUrl?.trim();
  if (!url) return;

  if (url.startsWith("/")) {
    try {
      router.push(url as any);
    } catch (e) {
      console.warn("openLink: in-app route failed", url, e);
    }
    return;
  }

  const isWeb = /^https?:\/\//i.test(url);
  try {
    await Linking.openURL(url);
  } catch (e) {
    if (!isWeb) {
      console.warn("openLink: cannot open", url, e);
      return;
    }
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (err) {
      console.warn("openLink: browser fallback failed", url, err);
    }
  }
}

/** True when a banner carries a link worth making it pressable for. */
export const hasLink = (url?: string | null): url is string => !!url && url.trim().length > 0;
