// Same setup as app/i18n.ts: one "common" namespace, three languages.
import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "./locales/en/common.json";
import teCommon from "./locales/te/common.json";
import hiCommon from "./locales/hi/common.json";

export const SUPPORTED_LANGUAGES = ["en", "te", "hi"] as const;

// A named instance rather than the i18next default export, so it is explicit
// which object initReactI18next binds to useTranslation().
const i18n = createInstance();

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  // English until languageStore's hydrateLanguage() resolves a stored choice.
  lng: "en",
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
    // React already escapes rendered text.
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
