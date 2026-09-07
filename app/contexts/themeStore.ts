import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'app_theme';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  hydrateTheme: () => Promise<void>;
}

// Fire-and-forget: a failed write must never block the UI from switching.
const persist = (theme: 'light' | 'dark') => {
  AsyncStorage.setItem(THEME_KEY, theme).catch(() => {});
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light',
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      persist(next);
      return { theme: next };
    }),
  setTheme: (theme) => {
    persist(theme);
    set({ theme });
  },
  // Called once on boot, before the splash screen hides, so the app never
  // flashes light before settling on the saved choice.
  hydrateTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_KEY);
      if (stored === 'light' || stored === 'dark') set({ theme: stored });
    } catch {
      // Storage unavailable — keep the 'light' default.
    }
  },
}));
