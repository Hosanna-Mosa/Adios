import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "@/components/ui/Toast";
import { useTokens } from "@/contexts/themeStore";
import { requestPasswordResetOtp, resetPassword } from "@/services/auth.service";
import { errorMessage } from "@/utils/errorMessage";
import { createStyles } from "./auth.styles";

// The web panel's four-step reset (VendorForgotPasswordCard): email → 6-digit
// code → new password → done. Same validation rules and endpoints.

export type ForgotStep = "email" | "otp" | "reset" | "done";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 6;

export function useForgotPassword() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tokens = useTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const toast = useToast();
  const [step, setStep] = useState<ForgotStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const sendOtp = async () => {
    if (!EMAIL_RE.test(email.trim())) {
      setError(t("forgot.enterValidEmail"));
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      await requestPasswordResetOtp(email);
      toast.show(t("forgot.otpSentIfExists"), "success");
      setStep("otp");
    } catch (e) {
      setError(errorMessage(e, t("forgot.sendFailed")));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = () => {
    if (!/^\d{6}$/.test(otp.trim())) {
      setError(t("forgot.enterValidOtp"));
      return;
    }
    setError(undefined);
    setStep("reset");
  };

  const submitReset = async () => {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(t("password.tooShort", { count: MIN_PASSWORD_LENGTH }));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("password.mismatch"));
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      setStep("done");
    } catch (e) {
      // A wrong or expired code is the usual cause — send them back to fix it.
      setError(errorMessage(e, t("forgot.resetFailed")));
      setStep("otp");
    } finally {
      setLoading(false);
    }
  };

  const back = () => {
    setError(undefined);
    if (step === "otp") setStep("email");
    else if (step === "reset") setStep("otp");
  };

  return {
    insets,
    tokens,
    styles,
    step,
    email,
    setEmail,
    otp,
    setOtp: (value: string) => setOtp(value.replace(/\D/g, "").slice(0, 6)),
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    sendOtp,
    verifyOtp,
    submitReset,
    back,
  };
}
