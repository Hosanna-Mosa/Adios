import React from "react";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { SelectLanguageBody } from "@/features/language/components/SelectLanguageBody";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useLanguageStore, type SupportedLanguage } from "@/contexts/languageStore";

// Language gate (ADIOS_MULTILINGUAL_DEVELOPMENT_PLAN.md, Phase 3 / Section 7).
// Reached whenever app/_layout.tsx's routing guard finds the current process
// unauthenticated and not yet past the gate (see `languageConfirmed`) — on
// first launch, on every subsequent unauthenticated cold start, and after
// sign-out. A previously persisted language pre-selects an option here, but
// only tapping Continue lets the guard move on to Login.
export default function SelectLanguageScreen() {
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const confirmLanguage = useLanguageStore((s) => s.confirmLanguage);

  // Selecting only updates the language (and pre-selects for next time); it
  // does not navigate. app/_layout.tsx's routing-guard effect depends on
  // `languageConfirmed`, not `language`, so nothing happens until Continue.
  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
  };

  const handleContinue = () => {
    confirmLanguage();
  };

  return (
    <ScreenShell style={{ justifyContent: "center" }}>
      <SelectLanguageBody
        tokens={tokens}
        onSelect={handleSelect}
        selectedLanguage={language}
        onContinue={handleContinue}
      />
    </ScreenShell>
  );
}
