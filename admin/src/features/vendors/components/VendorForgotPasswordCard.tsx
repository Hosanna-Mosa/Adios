import { ArrowLeft, ArrowRight, CheckCircle, Loader2, Lock, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ForgotStep } from "../hooks/useVendorLogin";

interface VendorForgotPasswordCardProps {
  step: ForgotStep;
  isLoading: boolean;
  forgotEmail: string;
  onForgotEmailChange: (value: string) => void;
  forgotOtp: string;
  onForgotOtpChange: (value: string) => void;
  forgotNewPassword: string;
  onForgotNewPasswordChange: (value: string) => void;
  forgotConfirmPassword: string;
  onForgotConfirmPasswordChange: (value: string) => void;
  onSendOtp: () => void;
  onVerifyOtpStep: () => void;
  onChangeEmailStep: () => void;
  onResetPassword: () => void;
  onCancel: () => void;
  onDone: () => void;
}

/** The forgot-password card body: switches between the email/otp/reset/done steps. */
export function VendorForgotPasswordCard({
  step,
  isLoading,
  forgotEmail,
  onForgotEmailChange,
  forgotOtp,
  onForgotOtpChange,
  forgotNewPassword,
  onForgotNewPasswordChange,
  forgotConfirmPassword,
  onForgotConfirmPasswordChange,
  onSendOtp,
  onVerifyOtpStep,
  onChangeEmailStep,
  onResetPassword,
  onCancel,
  onDone,
}: VendorForgotPasswordCardProps) {
  const { t } = useTranslation();
  if (step === "email") {
    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("vendorAuth.emailAddress")}</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("vendorAuth.enterRegisteredEmail")} className="pl-10 h-11" value={forgotEmail} onChange={(e) => onForgotEmailChange(e.target.value)} />
          </div>
        </div>

        <Button className="w-full h-11 text-base font-semibold" onClick={onSendOtp} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <>
              {t("vendorAuth.sendOtp")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        <button type="button" onClick={onCancel} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors pt-2">
          {t("vendorAuth.backToSignIn")}
        </button>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("vendorAuth.enterOtp")}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("vendorAuth.sixDigitCode")}
              className="pl-10 h-11 text-center text-lg tracking-widest font-bold"
              maxLength={6}
              value={forgotOtp}
              onChange={(e) => onForgotOtpChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </div>
        </div>

        <Button className="w-full h-11 text-base font-semibold" onClick={onVerifyOtpStep}>
          {t("vendorAuth.verifyOtp")}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={onChangeEmailStep} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> {t("vendorAuth.changeEmail")}
          </button>
          <button type="button" onClick={onSendOtp} className="text-sm text-primary hover:underline" disabled={isLoading}>
            {t("vendorAuth.resendOtp")}
          </button>
        </div>
      </div>
    );
  }

  if (step === "reset") {
    return (
      <div className="space-y-5">
        <div className="p-3 bg-muted/30 rounded-xl text-center">
          <p className="text-xs text-muted-foreground">{t("vendorAuth.otpVerified")}</p>
          <p className="text-sm font-semibold text-success">{t("vendorAuth.codeColon", { code: forgotOtp, defaultValue: "Code: {{code}}" })}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("vendorAuth.newPassword")}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="password" placeholder={t("vendorAuth.min6Characters")} className="pl-10 h-11" value={forgotNewPassword} onChange={(e) => onForgotNewPasswordChange(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("vendorAuth.confirmPassword")}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="password" placeholder={t("vendorAuth.reEnterNewPassword")} className="pl-10 h-11" value={forgotConfirmPassword} onChange={(e) => onForgotConfirmPasswordChange(e.target.value)} />
          </div>
        </div>

        {forgotConfirmPassword.length > 0 && forgotNewPassword !== forgotConfirmPassword && <p className="text-xs text-destructive -mt-3">{t("vendorAuth.passwordsDoNotMatch")}</p>}

        <Button className="w-full h-11 text-base font-semibold" onClick={onResetPassword} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : t("vendorAuth.resetPassword")}
        </Button>
      </div>
    );
  }

  // step === "done"
  return (
    <div className="space-y-6 text-center">
      <div className="text-success space-y-2">
        <CheckCircle className="h-12 w-12 mx-auto" />
        <p className="text-lg font-semibold">{t("vendorAuth.allSet")}</p>
        <p className="text-sm text-muted-foreground">{t("vendorAuth.signInWithNewPassword")}</p>
      </div>
      <Button className="w-full h-11 text-base font-semibold" onClick={onDone}>
        {t("vendorAuth.backToSignIn")}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
