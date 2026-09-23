import React from "react";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { SelectLanguageBody } from "@/features/language/components/SelectLanguageBody";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useLanguageStore, type SupportedLanguage } from "@/contexts/languageStore";
import { router } from "expo-router";

// Settings/Profile language switcher (ADIOS_MULTILINGUAL_DEVELOPMENT_PLAN.md,
// Phase 4 / Section 8) — reuses the same SelectLanguageBody built for the
// first-launch gate (select-language.tsx), one shared component, two entry
// points. Unlike the first-launch screen, this one navigates back afterward
// since the user got here deliberately from a menu, not a routing gate.
export default function LanguageSettingsScreen() {
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    if (router.canGoBack()) router.back();
  };

  return (
    <ScreenShell style={{ justifyContent: "center" }}>
      <SelectLanguageBody tokens={tokens} theme={theme} onSelect={handleSelect} />
    </ScreenShell>
  );
}
