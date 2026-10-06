import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "@/components/ui/Toast";
import { useLanguageStore, type SupportedLanguage } from "@/contexts/languageStore";
import { useTokens } from "@/contexts/themeStore";
import i18n from "@/i18n";
import { createStyles } from "./language.styles";

/**
 * Both language screens. On first launch a tap only previews the language and
 * Continue saves it; in Account → Language a tap saves straight away.
 */
export function useLanguagePicker() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tokens = useTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const toast = useToast();
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const [choice, setChoice] = useState<SupportedLanguage>((i18n.language as SupportedLanguage) || "en");

  return {
    insets,
    tokens,
    styles,
    // First launch
    choice,
    preview: (code: SupportedLanguage) => {
      setChoice(code);
      i18n.changeLanguage(code);
    },
    confirm: () => setLanguage(choice),
    // Account → Language
    current: language ?? "en",
    change: (code: SupportedLanguage) => {
      if (code === language) return;
      setLanguage(code);
      toast.show(t("language.changed"), "success");
    },
  };
}
