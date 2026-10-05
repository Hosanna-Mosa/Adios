import { useMemo } from "react";
import Constants from "expo-constants";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePartnerTabBarHeight } from "@/components/PartnerTabBar";
import { showAlert } from "@/components/ui/AppAlert";
import { useAuthStore } from "@/contexts/authStore";
import { useLanguageStore } from "@/contexts/languageStore";
import { useThemeStore, useTokens } from "@/contexts/themeStore";
import { usePartnerProfile } from "@/queries/profile.queries";
import { createStyles } from "./account.styles";

const LANGUAGE_NAMES = { en: "English", te: "తెలుగు", hi: "हिन्दी" } as const;

/** The Account tab: who is signed in, preferences, and sign-out. */
export function useAccount() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tabBarHeight = usePartnerTabBarHeight();
  const tokens = useTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const { profile } = usePartnerProfile();
  const signOut = useAuthStore((s) => s.signOut);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const language = useLanguageStore((s) => s.language) ?? "en";

  const confirmSignOut = () =>
    showAlert(
      t("account.signOutTitle"),
      t("account.signOutMessage"),
      [
        { text: t("actions.cancel"), style: "cancel" },
        { text: t("account.signOut"), style: "destructive", onPress: () => void signOut() },
      ],
      "warning",
    );

  return {
    insets,
    tabBarHeight,
    tokens,
    styles,
    profile,
    isMeat: profile?.role === "meat_vendor",
    isDark: theme === "dark",
    toggleTheme,
    languageName: LANGUAGE_NAMES[language],
    confirmSignOut,
    version: Constants.expoConfig?.version ?? "1.0.0",
  };
}
