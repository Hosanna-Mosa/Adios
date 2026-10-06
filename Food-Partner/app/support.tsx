import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Accordion } from "@/components/ui/Accordion";
import { Header } from "@/components/ui/Header";
import { ListGroup } from "@/components/ui/ListGroup";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { ScreenTitle } from "@/components/ui/ScreenTitle";
import { ContactSection } from "@/features/support/components/ContactSection";
import { RecentOrderSection } from "@/features/support/components/RecentOrderSection";
import { useSupportHub } from "@/features/support/useSupportHub";

/** Help & support — the customer app's support screen, for partners. */
export default function SupportScreen() {
  const { t } = useTranslation();
  const { insets, tokens, styles, recentOrder, openCases, faqs, phone, email, call, sendEmail } = useSupportHub();

  return (
    <ScreenShell
      style={{ paddingTop: insets.top + 8 }}
      header={<Header title={t("support.title")} onBack={() => router.back()} />}
      scroll
      contentStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
    >
      <ScreenTitle title={t("support.howCanWeHelp")} subtitle={t("support.heroSubtitle")} style={styles.title} />
      <RecentOrderSection order={recentOrder} styles={styles} />
      <ContactSection openCases={openCases} phone={phone} email={email} call={call} sendEmail={sendEmail} tokens={tokens} />
      <ListGroup title={t("support.commonQuestions")} grouped={false} delay={160}>
        <Accordion items={faqs} />
      </ListGroup>
    </ScreenShell>
  );
}
