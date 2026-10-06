import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { ListGroup } from "@/components/ui/ListGroup";
import { ListRow } from "@/components/ui/ListRow";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import type { ThemeTokens } from "@/constants/colors";

interface Props {
  isDark: boolean;
  toggleTheme: () => void;
  languageName: string;
  tokens: ThemeTokens;
}

/** Dark mode and language. */
export function PreferencesSection({ isDark, toggleTheme, languageName, tokens }: Props) {
  const { t } = useTranslation();
  return (
    <ListGroup title={t("account.preferences")} delay={100}>
      <ListRow
        icon={isDark ? "moon" : "sunny-outline"}
        label={t("account.darkMode")}
        description={isDark ? t("account.darkModeOn") : t("account.darkModeOff")}
        right={<ToggleSwitch value={isDark} onValueChange={toggleTheme} onColor={tokens.brand} accessibilityLabel={t("account.darkMode")} />}
        divider
      />
      <ListRow icon="language-outline" label={t("account.language")} description={languageName} onPress={() => router.push("/language-settings")} />
    </ListGroup>
  );
}
