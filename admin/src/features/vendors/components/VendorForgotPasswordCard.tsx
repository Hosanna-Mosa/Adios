import { ArrowLeft, ArrowRight, CheckCircle, Loader2, Lock, Mail } from "lucide-react";
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
  if (step === "email") {
    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Enter your registered email" className="pl-10 h-11" value={forgotEmail} onChange={(e) => onForgotEmailChange(e.target.value)} />
          </div>
        </div>

        <Button className="w-full h-11 text-base font-semibold" onClick={onSendOtp} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <>
              Send OTP
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        <button type="button" onClick={onCancel} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors pt-2">
          Back to Sign In
        </button>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Enter OTP</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="6-digit code"
              className="pl-10 h-11 text-center text-lg tracking-widest font-bold"
              maxLength={6}
              value={forgotOtp}
              onChange={(e) => onForgotOtpChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </div>
        </div>

        <Button className="w-full h-11 text-base font-semibold" onClick={onVerifyOtpStep}>
          Verify OTP
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={onChangeEmailStep} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Change email
          </button>
          <button type="button" onClick={onSendOtp} className="text-sm text-primary hover:underline" disabled={isLoading}>
            Resend OTP
          </button>
        </div>
      </div>
    );
  }

  if (step === "reset") {
    return (
      <div className="space-y-5">
        <div className="p-3 bg-muted/30 rounded-xl text-center">
          <p className="text-xs text-muted-foreground">OTP Verified</p>
          <p className="text-sm font-semibold text-success">Code: {forgotOtp}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="password" placeholder="Min. 6 characters" className="pl-10 h-11" value={forgotNewPassword} onChange={(e) => onForgotNewPasswordChange(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="password" placeholder="Re-enter your new password" className="pl-10 h-11" value={forgotConfirmPassword} onChange={(e) => onForgotConfirmPasswordChange(e.target.value)} />
          </div>
        </div>

        {forgotConfirmPassword.length > 0 && forgotNewPassword !== forgotConfirmPassword && <p className="text-xs text-destructive -mt-3">Passwords do not match</p>}

        <Button className="w-full h-11 text-base font-semibold" onClick={onResetPassword} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Reset Password"}
        </Button>
      </div>
    );
  }

  // step === "done"
  return (
    <div className="space-y-6 text-center">
      <div className="text-success space-y-2">
        <CheckCircle className="h-12 w-12 mx-auto" />
        <p className="text-lg font-semibold">All set!</p>
        <p className="text-sm text-muted-foreground">Sign in with your new password.</p>
      </div>
      <Button className="w-full h-11 text-base font-semibold" onClick={onDone}>
        Back to Sign In
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
