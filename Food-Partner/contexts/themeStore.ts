import { create } from "zustand";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { designTokens } from "@/constants/colors";

// Same store as app/contexts/themeStore.ts. The one difference: before the
// partner has picked a theme, the device's own light/dark setting is used.

const THEME_KEY = "partner_theme";

export type ThemeName = "light" | "dark";

interface ThemeState {
  theme: ThemeName;
  toggleTheme: () => void;
  setTheme: (theme: ThemeName) => void;
  hydrateTheme: () => Promise<void>;
}

// Fire-and-forget: a failed write must never block the UI from switching.
const persist = (theme: ThemeName) => {
  AsyncStorage.setItem(THEME_KEY, theme).catch(() => {});
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: Appearance.getColorScheme() === "dark" ? "dark" : "light",
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "light" ? "dark" : "light";
      persist(next);
      return { theme: next };
    }),
  setTheme: (theme) => {
    persist(theme);
    set({ theme });
  },
  // Called once on boot, before the splash hides, so the app never flashes
  // the wrong theme before settling on the saved choice.
  hydrateTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_KEY);
      if (stored === "light" || stored === "dark") set({ theme: stored });
    } catch {
      // Storage unavailable — keep the device default.
    }
  },
}));

/** The current theme's design tokens — what every styled component reads. */
export const useTokens = () => designTokens[useThemeStore((s) => s.theme)];
