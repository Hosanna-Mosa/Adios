import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/i18n';

const LANGUAGE_KEY = 'driver_language';

export type SupportedLanguage = 'en' | 'te' | 'hi';

interface LanguageState {
  /** null until hydrateLanguage() resolves and finds nothing stored — used to
   * pre-select an option on the language-gate screen. */
  language: SupportedLanguage | null;
  /**
   * In-memory only — deliberately never written to AsyncStorage. True once
   * the driver has tapped Continue on the language-gate screen for the
   * current app process. Always starts false on a fresh cold start (unlike
   * `language`, which is persisted), and app/_layout.tsx's routing gate keys
   * off this instead of `language` — so a previously-persisted language
   * choice can pre-select an option without ever letting the gate screen
   * itself be silently skipped. resetLanguageGate() flips it back to false on
   * logout for the same reason.
   */
  languageConfirmed: boolean;
  setLanguage: (language: SupportedLanguage) => void;
  /** Called by the language-gate screen's Continue button. */
  confirmLanguage: () => void;
  /** Called on logout so the language gate reappears before the next login,
   * while the persisted language choice itself is left untouched. */
  resetLanguageGate: () => void;
  /** Called once on boot, before the splash screen hides. */
  hydrateLanguage: () => Promise<void>;
}

// Fire-and-forget: a failed write must never block the UI from switching.
const persist = (language: SupportedLanguage) => {
  AsyncStorage.setItem(LANGUAGE_KEY, language).catch(() => {});
};

function isSupportedLanguage(value: string | null): value is SupportedLanguage {
  return value === 'en' || value === 'te' || value === 'hi';
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: null,
  languageConfirmed: false,
  setLanguage: (language) => {
    persist(language);
    i18n.changeLanguage(language);
    set({ language });
  },
  confirmLanguage: () => set({ languageConfirmed: true }),
  resetLanguageGate: () => set({ languageConfirmed: false }),
  hydrateLanguage: async () => {
    try {
      const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (isSupportedLanguage(stored)) {
        await i18n.changeLanguage(stored);
        set({ language: stored });
      }
      // else: leave `language` as null — the first-launch gate in app/_layout.tsx
      // treats null as "no language selected yet" and routes to /select-language.
    } catch {
      // Storage unavailable — leave `language` as null, same as "not set yet".
    }
  },
}));
