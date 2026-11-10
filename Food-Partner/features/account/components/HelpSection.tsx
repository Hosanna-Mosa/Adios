import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { ListGroup } from "@/components/ui/ListGroup";
import { ListRow } from "@/components/ui/ListRow";
import type { ThemeTokens } from "@/constants/colors";
import { env } from "@/utils/env";

/** Password, account deletion, support, and the privacy policy. */
export function HelpSection({ tokens }: { tokens: ThemeTokens }) {
  const { t } = useTranslation();
  return (
    <>
      <ListGroup title={t("account.security")} delay={140}>
        <ListRow icon="key-outline" label={t("account.changePassword")} description={t("account.changePasswordHint")} onPress={() => router.push("/change-password")} divider />
        <ListRow icon="trash-outline" label={t("account.deleteAccount")} description={t("account.deleteAccountHint")} destructive onPress={() => router.push("/delete-account")} />
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
        <ListRow
          icon="chatbubbles-outline"
          label={t("account.yourCases")}
          description={t("account.yourCasesHint")}
          onPress={() => router.push("/support-chat")}
          divider={!!env.privacyPolicyUrl}
        />
        {/* Hidden until EXPO_PUBLIC_PRIVACY_POLICY_URL is set, like the support contacts. */}
        {!!env.privacyPolicyUrl && (
          <ListRow
            icon="shield-checkmark-outline"
            label={t("account.privacyPolicy")}
            description={t("account.privacyPolicyHint")}
            onPress={() => void WebBrowser.openBrowserAsync(env.privacyPolicyUrl).catch(() => {})}
          />
        )}
      </ListGroup>
    </>
  );
}
