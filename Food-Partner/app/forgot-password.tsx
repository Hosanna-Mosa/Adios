import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Header } from "@/components/ui/Header";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { AuthHero } from "@/features/auth/components/AuthHero";
import { ForgotPasswordSteps } from "@/features/auth/components/ForgotPasswordSteps";
import { useForgotPassword } from "@/features/auth/useForgotPassword";

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const f = useForgotPassword();
  const subtitle = {
    email: t("forgot.emailSubtitle"),
    otp: t("forgot.otpSubtitle", { email: f.email.trim() }),
    reset: t("forgot.resetSubtitle"),
    done: t("forgot.doneSubtitle"),
  }[f.step];

  return (
    <ScreenShell
      keyboardAvoiding
      style={{ paddingTop: f.insets.top + 8 }}
      header={<Header onBack={f.step === "email" || f.step === "done" ? () => router.back() : f.back} />}
      scroll
      contentStyle={[f.styles.content, { paddingTop: 12, paddingBottom: f.insets.bottom + 24 }]}
    >
      <AuthHero
        title={f.step === "done" ? t("forgot.doneTitle") : t("forgot.title")}
        subtitle={subtitle}
        icon={f.step === "done" ? "checkmark" : "key"}
        styles={f.styles}
      />
      <ForgotPasswordSteps
        step={f.step}
        email={f.email}
        setEmail={f.setEmail}
        otp={f.otp}
        setOtp={f.setOtp}
        newPassword={f.newPassword}
        setNewPassword={f.setNewPassword}
        confirmPassword={f.confirmPassword}
        setConfirmPassword={f.setConfirmPassword}
        loading={f.loading}
        error={f.error}
        sendOtp={f.sendOtp}
        verifyOtp={f.verifyOtp}
        submitReset={f.submitReset}
        styles={f.styles}
        tokens={f.tokens}
      />
    </ScreenShell>
  );
}
