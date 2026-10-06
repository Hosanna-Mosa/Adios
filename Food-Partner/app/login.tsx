import { useTranslation } from "react-i18next";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { AuthHero } from "@/features/auth/components/AuthHero";
import { LoginFooter } from "@/features/auth/components/LoginFooter";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useLogin } from "@/features/auth/useLogin";

export default function LoginScreen() {
  const { t } = useTranslation();
  const {
    insets, tokens, styles, identifier, setIdentifier, password, setPassword, errors, loading, submit, canApply, openApply,
  } = useLogin();

  return (
    <ScreenShell keyboardAvoiding scroll contentStyle={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
      <AuthHero title={t("auth.title")} subtitle={t("auth.subtitle")} styles={styles} />
      <LoginForm
        identifier={identifier}
        setIdentifier={setIdentifier}
        password={password}
        setPassword={setPassword}
        errors={errors}
        loading={loading}
        submit={submit}
        styles={styles}
        tokens={tokens}
      />
      <LoginFooter canApply={canApply} openApply={openApply} styles={styles} tokens={tokens} />
    </ScreenShell>
  );
}
