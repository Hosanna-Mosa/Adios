import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { LanguageHero } from "@/features/language/components/LanguageHero";
import { LanguageList } from "@/features/language/components/LanguageList";
import { useLanguagePicker } from "@/features/language/useLanguagePicker";

export default function SelectLanguageScreen() {
  const { t } = useTranslation();
  const { insets, tokens, styles, choice, preview, confirm } = useLanguagePicker();

  return (
    <ScreenShell
      style={{ paddingTop: insets.top + 32 }}
      scroll
      contentStyle={styles.content}
      footer={<Button title={t("actions.continue")} onPress={confirm} fullWidth />}
    >
      <LanguageHero styles={styles} />
      <LanguageList selected={choice} onSelect={preview} styles={styles} tokens={tokens} />
    </ScreenShell>
  );
}
