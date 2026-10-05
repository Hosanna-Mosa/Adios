import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/ui/Header";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { LanguageList } from "@/features/language/components/LanguageList";
import { useLanguagePicker } from "@/features/language/useLanguagePicker";

export default function LanguageSettingsScreen() {
  const { t } = useTranslation();
  const { insets, tokens, styles, current, change } = useLanguagePicker();

  return (
    <ScreenShell
      style={{ paddingTop: insets.top + 8 }}
      header={<Header title={t("language.title")} subtitle={t("language.settingsHint")} onBack={() => router.back()} />}
      scroll
      contentStyle={[styles.settingsContent, { paddingBottom: insets.bottom + 24 }]}
    >
      <LanguageList selected={current} onSelect={change} styles={styles} tokens={tokens} />
    </ScreenShell>
  );
}
