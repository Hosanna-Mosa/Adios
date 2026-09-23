// i18n foundation for the Driver app — mirrors app/i18n.ts's shape exactly.
// One namespace ("common"), three languages. This file's shape does not
// change as coverage grows — only the resources object does.
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import teCommon from './locales/te/common.json';
import hiCommon from './locales/hi/common.json';

export const SUPPORTED_LANGUAGES = ['en', 'te', 'hi'] as const;

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  // English until languageStore's hydrateLanguage() resolves a stored choice
  // (or the user picks one on first launch) and calls i18n.changeLanguage().
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: SUPPORTED_LANGUAGES,
  ns: ['common'],
  defaultNS: 'common',
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

export default i18n;
