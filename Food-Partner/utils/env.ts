import Constants from "expo-constants";

// The one place the app reads its configuration. Everything comes from
// EXPO_PUBLIC_* variables (.env locally, EAS environment variables for cloud
// builds), with app.config.js `extra` as the fallback for builds where Metro
// did not inline them. Nothing is hardcoded — see .env.example.

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

const clean = (value: string | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed.replace(/\/+$/, "") : "";
};

/** Every route is mounted under /api/v1; accept the bare server origin too. */
const withApiPrefix = (url: string) => (!url || /\/api(\/|$)/.test(url) ? url : `${url}/api/v1`);

export const env = {
  /** e.g. https://api.example.com/api/v1 */
  apiUrl: withApiPrefix(clean(process.env.EXPO_PUBLIC_API_URL || extra.apiUrl)),
  supportPhone: clean(process.env.EXPO_PUBLIC_SUPPORT_PHONE || extra.supportPhone),
  supportEmail: clean(process.env.EXPO_PUBLIC_SUPPORT_EMAIL || extra.supportEmail),
  partnerWebUrl: clean(process.env.EXPO_PUBLIC_PARTNER_WEB_URL || extra.partnerWebUrl),
};

/** Socket.IO lives on the server root, not under /api/v1. */
export const socketBaseUrl = env.apiUrl.split("/api")[0] || env.apiUrl;

if (!env.apiUrl) {
  console.warn("[env] EXPO_PUBLIC_API_URL is not set — copy .env.example to .env and fill it in.");
}
