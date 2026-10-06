import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { ListGroup } from "@/components/ui/ListGroup";
import { ListRow } from "@/components/ui/ListRow";
import type { ThemeTokens } from "@/constants/colors";

/** Password and support. */
export function HelpSection({ tokens }: { tokens: ThemeTokens }) {
  const { t } = useTranslation();
  return (
    <>
      <ListGroup title={t("account.security")} delay={140}>
        <ListRow icon="key-outline" label={t("account.changePassword")} description={t("account.changePasswordHint")} onPress={() => router.push("/change-password")} />
      </ListGroup>
      <ListGroup title={t("account.help")} delay={180}>
        <ListRow
          icon="help-buoy-outline"
          iconColor={tokens.success}
          iconBackground={tokens.successSkin}
          label={t("account.helpSupport")}
          description={t("account.helpSupportHint")}
          onPress={() => router.push("/support")}
          divider
        />
        <ListRow icon="chatbubbles-outline" label={t("account.yourCases")} description={t("account.yourCasesHint")} onPress={() => router.push("/support-chat")} />
      </ListGroup>
    </>
  );
}
