import { Store, KeyRound, CheckCircle } from "lucide-react";
import { useVendorLogin } from "@/features/vendors/hooks/useVendorLogin";
import { AuthShell } from "@/features/vendors/components/AuthShell";
import { VendorLoginForm } from "@/features/vendors/components/VendorLoginForm";
import { VendorForgotPasswordCard } from "@/features/vendors/components/VendorForgotPasswordCard";

export default function VendorLogin() {
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
        title={forgotStep === "done" ? "Password Reset" : "Reset Password"}
        subtitle={
          <>
            {forgotStep === "email" && "Enter your registered email to receive an OTP."}
            {forgotStep === "otp" && `We sent a 6-digit code to ${forgotEmail}`}
            {forgotStep === "reset" && "Enter the OTP and your new password."}
            {forgotStep === "done" && "Your password has been reset successfully."}
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
    <AuthShell icon={<Store className="h-8 w-8 text-primary" />} title="Vendor Portal" subtitle="Sign in to manage your restaurant menu and orders." headerClassName="text-center mb-10">
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
