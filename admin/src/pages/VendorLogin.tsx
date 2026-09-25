import { Store, KeyRound, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useVendorLogin } from "@/features/vendors/hooks/useVendorLogin";
import { AuthShell } from "@/features/vendors/components/AuthShell";
import { VendorLoginForm } from "@/features/vendors/components/VendorLoginForm";
import { VendorForgotPasswordCard } from "@/features/vendors/components/VendorForgotPasswordCard";

export default function VendorLogin() {
  const { t } = useTranslation();
  const {
    isLoading,
    identifier,
    setIdentifier,
    password,
    setPassword,
    handleLogin,
    showForgot,
    setShowForgot,
    forgotStep,
    setForgotStep,
    forgotEmail,
    setForgotEmail,
    forgotOtp,
    setForgotOtp,
    forgotNewPassword,
    setForgotNewPassword,
    forgotConfirmPassword,
    setForgotConfirmPassword,
    handleSendOtp,
    handleVerifyOtp,
    handleResetPassword,
    cancelForgotFlow,
    closeForgotFlow,
  } = useVendorLogin();

  if (showForgot) {
    return (
      <AuthShell
        icon={forgotStep === "done" ? <CheckCircle className="h-8 w-8 text-success" /> : <KeyRound className="h-8 w-8 text-primary" />}
        title={forgotStep === "done" ? t("vendorAuth.passwordReset") : t("vendorAuth.resetPassword")}
        subtitle={
          <>
            {forgotStep === "email" && t("vendorAuth.enterRegisteredEmailToReceiveOtp")}
            {forgotStep === "otp" && t("vendorAuth.weSentA6DigitCodeTo", { email: forgotEmail, defaultValue: "We sent a 6-digit code to {{email}}" })}
            {forgotStep === "reset" && t("vendorAuth.enterOtpAndNewPassword")}
            {forgotStep === "done" && t("vendorAuth.passwordResetSuccessfully")}
          </>
        }
      >
        <VendorForgotPasswordCard
          step={forgotStep}
          isLoading={isLoading}
          forgotEmail={forgotEmail}
          onForgotEmailChange={setForgotEmail}
          forgotOtp={forgotOtp}
          onForgotOtpChange={setForgotOtp}
          forgotNewPassword={forgotNewPassword}
          onForgotNewPasswordChange={setForgotNewPassword}
          forgotConfirmPassword={forgotConfirmPassword}
          onForgotConfirmPasswordChange={setForgotConfirmPassword}
          onSendOtp={handleSendOtp}
          onVerifyOtpStep={handleVerifyOtp}
          onChangeEmailStep={() => setForgotStep("email")}
          onResetPassword={handleResetPassword}
          onCancel={cancelForgotFlow}
          onDone={closeForgotFlow}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell icon={<Store className="h-8 w-8 text-primary" />} title={t("vendorAuth.vendorPortal")} subtitle={t("vendorAuth.signInToManageMenuAndOrders")} headerClassName="text-center mb-10">
      <VendorLoginForm
        identifier={identifier}
        onIdentifierChange={setIdentifier}
        password={password}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
        isLoading={isLoading}
        onForgotPasswordClick={() => setShowForgot(true)}
      />
    </AuthShell>
  );
}
