import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "@/i18n";

// Same languages as the customer app (app/contexts/languageStore.ts). A
// partner picks one on first launch; after that the choice is remembered and
// can be changed from Account → Language.

const LANGUAGE_KEY = "partner_language";

export type SupportedLanguage = "en" | "te" | "hi";

interface LanguageState {
  /** null until a language has been chosen on this device. */
  language: SupportedLanguage | null;
  /** True once hydrateLanguage() has read storage. */
  isHydrated: boolean;
  setLanguage: (language: SupportedLanguage) => void;
  hydrateLanguage: () => Promise<void>;
}

function isSupportedLanguage(value: string | null): value is SupportedLanguage {
  return value === "en" || value === "te" || value === "hi";
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: null,
  isHydrated: false,
  setLanguage: (language) => {
    AsyncStorage.setItem(LANGUAGE_KEY, language).catch(() => {});
    i18n.changeLanguage(language);
    set({ language });
  },
  hydrateLanguage: async () => {
    try {
      const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (isSupportedLanguage(stored)) {
        await i18n.changeLanguage(stored);
        set({ language: stored });
      }
    } catch {
      // Storage unavailable — treated as "not chosen yet".
    } finally {
      set({ isHydrated: true });
    }
  },
}));
