import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/ui/Header";
import { InfoNote } from "@/components/ui/InfoNote";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { DeleteAccountForm } from "@/features/account/components/DeleteAccountForm";
import { useDeleteAccount } from "@/features/account/useDeleteAccount";

/** Account → Delete account: Google Play requires partners can delete their account in the app. */
export default function DeleteAccountScreen() {
  const { t } = useTranslation();
  const d = useDeleteAccount();

  return (
    <ScreenShell
      keyboardAvoiding
      style={{ paddingTop: d.insets.top + 8 }}
      header={<Header title={t("deleteAccount.title")} subtitle={t("deleteAccount.intro")} onBack={() => router.back()} backDisabled={d.loading} />}
      scroll
      contentStyle={[d.styles.formContent, { paddingBottom: d.insets.bottom + 24 }]}
    >
      <DeleteAccountForm
        password={d.password}
        setPassword={d.setPassword}
        error={d.error}
        loading={d.loading}
        submit={d.submit}
        styles={d.styles}
        tokens={d.tokens}
      />
      <InfoNote tone="warning" text={t("deleteAccount.beforeNote")} />
    </ScreenShell>
  );
}
