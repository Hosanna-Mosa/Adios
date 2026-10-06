import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/ui/Header";
import { InfoNote } from "@/components/ui/InfoNote";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { ChangePasswordForm } from "@/features/account/components/ChangePasswordForm";
import { useChangePassword } from "@/features/account/useChangePassword";

/** The web panel's Settings page: change the sign-in password, then sign in again. */
export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const p = useChangePassword();

  return (
    <ScreenShell
      keyboardAvoiding
      style={{ paddingTop: p.insets.top + 8 }}
      header={<Header title={t("password.title")} subtitle={t("password.intro")} onBack={() => router.back()} backDisabled={p.loading} />}
      scroll
      contentStyle={[p.styles.formContent, { paddingBottom: p.insets.bottom + 24 }]}
    >
      <ChangePasswordForm
        current={p.current}
        setCurrent={p.setCurrent}
        next={p.next}
        setNext={p.setNext}
        confirm={p.confirm}
        setConfirm={p.setConfirm}
        errors={p.errors}
        loading={p.loading}
        submit={p.submit}
        minLength={p.minLength}
        styles={p.styles}
        tokens={p.tokens}
      />
      <InfoNote text={t("password.signOutNote")} />
    </ScreenShell>
  );
}
