import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { ListGroup } from "@/components/ui/ListGroup";
import { ListRow } from "@/components/ui/ListRow";
import type { ThemeTokens } from "@/constants/colors";

interface Props {
  openCases: number;
  phone: string;
  email: string;
  call: () => void;
  sendEmail: () => void;
  tokens: ThemeTokens;
}

/** Chat, call and email — the customer app's "Contact us" rows. Call/email appear only when configured. */
export function ContactSection({ openCases, phone, email, call, sendEmail, tokens }: Props) {
  const { t } = useTranslation();
  return (
    <ListGroup title={t("support.contactUs")} grouped={false} delay={120}>
      <ListRow
        card
        icon="chatbubble-ellipses"
        iconColor={tokens.brand}
        iconBackground={tokens.brandSkin}
        label={t("support.liveChat")}
        description={openCases ? t("support.openCases", { count: openCases }) : t("support.liveChatHint")}
        onPress={() => router.push("/support-chat")}
      />
      {phone ? <ListRow card icon="call" label={t("support.callUs")} description={phone} onPress={call} /> : null}
      {email ? <ListRow card icon="mail" label={t("support.emailUs")} description={t("support.emailHint", { email })} onPress={sendEmail} /> : null}
    </ListGroup>
  );
}
