import React from "react";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Box } from "@/components/ui/Box";
import { Header } from "@/components/ui/Header";
import { Colors } from "@/constants/colors";
import { useTranslation } from "react-i18next";
import { SelectLanguageBody } from "@/features/language/components/SelectLanguageBody";
import { useLanguageStore, type SupportedLanguage } from "@/store/languageStore";

// Post-onboarding switcher, reachable from Profile → Language. Reuses
// SelectLanguageBody without the onboarding gate: selecting a language here
// applies it immediately and does not require a Continue tap, since
// `languageConfirmed` is already true for a signed-in driver.
export default function LanguageSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
  };

  return (
    <Box style={{ flex: 1, backgroundColor: Colors.background, paddingBottom: insets.bottom }}>
      <Header title={t("language.language")} onBack={() => router.back()} />
      <Box style={{ flex: 1, justifyContent: "center" }}>
        <SelectLanguageBody onSelect={handleSelect} selectedLanguage={language} />
      </Box>
    </Box>
  );
}
