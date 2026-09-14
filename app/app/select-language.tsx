import React from "react";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { SelectLanguageBody } from "@/features/language/components/SelectLanguageBody";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useLanguageStore, type SupportedLanguage } from "@/contexts/languageStore";

// First-launch language gate (ADIOS_MULTILINGUAL_DEVELOPMENT_PLAN.md, Phase 3 /
// Section 7). Reached only when app/_layout.tsx's routing guard finds no
// language stored yet.
export default function SelectLanguageScreen() {
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  // No manual navigation on selection: app/_layout.tsx's routing-guard effect
  // depends on `language` and re-runs the moment it changes, redirecting away
  // from this screen to whatever the existing auth gate decides next.
  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
  };

  return (
    <ScreenShell style={{ justifyContent: "center" }}>
      <SelectLanguageBody tokens={tokens} onSelect={handleSelect} />
    </ScreenShell>
  );
}
