import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { RESEND_SECONDS } from "./useOTP.shared";
import { showAlert } from "@/components/ui/AppAlert";

// Split out of useOTP so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useOTPHandleKeyPress(
  phone: any, name: any, email: any, password: any, otp: any, setOtp: any, secondsLeft: any, setSecondsLeft: any,
  setResending: any, inputs: any, verifyOTP: any, requestOTP: any,
  emailLogin: boolean, verifyEmailOTP: any, requestEmailOTP: any,
) {
  const { t } = useTranslation();
  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  // The code is spent once it checks out, so this screen must not survive underneath:
  // otherwise Back from the next screen walks into the code step again.
  const leaveAuthStack = () => {
    if (router.canDismiss()) router.dismissAll();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6 || (emailLogin ? !email : !phone)) return;
    try {
      if (emailLogin) {
        const result = await verifyEmailOTP(email, code);
        leaveAuthStack();
        if (result.isNewUser) {
          // A new email has no phone number yet: ask for it, in place of the name step.
          router.replace({ pathname: "/enter-phone", params: { ticket: result.ticket } });
        } else {
          router.replace("/(tabs)");
        }
        return;
      }

      const result = await verifyOTP(phone, code, "USER", name, email, password);
      if (result.isNewUser) {
        // The phone checks out but there is no account yet: ask for a name to create it.
        leaveAuthStack();
        router.replace({ pathname: "/enter-name", params: { ticket: result.ticket } });
      } else {
        // Either a normal sign-in verification, or — when name/email/password were carried
        // through from the create-account form — the account was just created by this call.
        leaveAuthStack();
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      showAlert(t("app.auth.verificationFailed"), error.message || t("app.auth.thatCodeDidntWork"));
    }
  };

  const handleResend = async () => {
    if ((emailLogin ? !email : !phone) || secondsLeft > 0) return;
    setResending(true);
    try {
      if (emailLogin) await requestEmailOTP(email);
      else await requestOTP(phone);
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
