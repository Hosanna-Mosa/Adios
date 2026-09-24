// i18n foundation for the admin dashboard — same shape as frontend/i18n.ts,
// app/i18n.ts and driver/i18n.ts: persisted to localStorage, switched
// manually via a LanguageSwitcher in TopBar (shared by the admin/support
// DashboardLayout and the VendorLayout), no mandatory gate screen.
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "./locales/en/common.json";
import teCommon from "./locales/te/common.json";
import hiCommon from "./locales/hi/common.json";

export const SUPPORTED_LANGUAGES = ["en", "te", "hi"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGE_KEY = "admin_language";

function isSupportedLanguage(value: string | null): value is SupportedLanguage {
  return value === "en" || value === "te" || value === "hi";
}

function getInitialLanguage(): SupportedLanguage {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (isSupportedLanguage(stored)) return stored;
  } catch {
    // localStorage unavailable (private mode, disabled storage) — fall through.
  }
  return "en";
}

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  lng: getInitialLanguage(),
  fallbackLng: "en",
  supportedLngs: SUPPORTED_LANGUAGES,
  ns: ["common"],
  defaultNS: "common",
  resources: {
    en: { common: enCommon },
    te: { common: teCommon },
    hi: { common: hiCommon },
  },
  interpolation: {
    // React already escapes rendered text — i18next's own escaping would
    // double-escape values like "&" inside interpolated strings.
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

/** Switch the dashboard language and persist the choice for next visit. */
export function setLanguage(language: SupportedLanguage) {
  i18n.changeLanguage(language);
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // Fire-and-forget: a failed write must never block the language switch.
  }
}

export default i18n;
