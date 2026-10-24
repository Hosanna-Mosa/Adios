import * as WebBrowser from "expo-web-browser";

/**
 * Where the Terms and Privacy Policy are published. Set at build time
 * (EXPO_PUBLIC_*). Unset means "not published yet": the names are shown but
 * not tappable, rather than opening a dead page.
 */
export const TERMS_URL = process.env.EXPO_PUBLIC_TERMS_URL || "";
export const PRIVACY_POLICY_URL = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL || "";

export const openLegalPage = (url: string) => {
  if (url) WebBrowser.openBrowserAsync(url).catch(() => {});
};
