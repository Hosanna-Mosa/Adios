// i18n foundation — Phase 1 of ADIOS_MULTILINGUAL_DEVELOPMENT_PLAN.md.
//
// Deliberately minimal for this first slice: one namespace ("common"), three
// languages. Every other namespace/screen gets added the same way in later
// phases — this file's shape does not change, only its `resources` object
// grows.
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
