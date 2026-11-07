import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { RESEND_SECONDS } from "./useOTP.shared";
import { showAlert } from "@/components/ui/AppAlert";

// Split out of useOTP so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useOTPHandleKeyPress(phone: any, name: any, email: any, password: any, otp: any, setOtp: any, secondsLeft: any, setSecondsLeft: any, setResending: any, inputs: any, verifyOTP: any, requestOTP: any) {
  const { t } = useTranslation();
  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6 || !phone) return;
    try {
      const result = await verifyOTP(phone, code, "USER", name, email, password);
      if (result.isNewUser) {
        // Reached by entering a phone straight on the sign-in screen — it
        // checks out but there's no account yet, so go collect the rest. The
        // code is spent, so this screen must not survive underneath: otherwise
        // Back from "Create your account" walks into the auth flow again.
        if (router.canDismiss()) router.dismissAll();
        router.replace({ pathname: "/signup", params: { phone } });
      } else {
        // Either a normal sign-in verification, or — when name/email/password
        // were carried through from the create-account form — the account was
        // just created by this same call. `replace` alone only swaps this
        // screen, leaving sign-in (and any create-account screen) below it, so
        // pop the whole auth stack first.
        if (router.canDismiss()) router.dismissAll();
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      showAlert(t("app.auth.verificationFailed"), error.message || t("app.auth.thatCodeDidntWork"));
    }
  };

  const handleResend = async () => {
    if (!phone || secondsLeft > 0) return;
    setResending(true);
    try {
      await requestOTP(phone);
      setSecondsLeft(RESEND_SECONDS);
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } catch (error: any) {
      showAlert(t("app.auth.couldntResend"), error.message || t("app.auth.pleaseTryAgainInAMoment"));
    } finally {
      setResending(false);
    }
  };

  const handleCallInstead = () => {
    showAlert(t("app.auth.callRequested"), t("app.auth.wellRingYouWithYourCode"));
  };

  const isFilled = otp.every((d: any) => d.length === 1);

  return { handleKeyPress, handleVerify, handleResend, handleCallInstead, isFilled };
}
