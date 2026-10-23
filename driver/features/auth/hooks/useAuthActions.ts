import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useDriverStore } from "@/store/driverStore";
import { API_URL as apiUrl } from "@/utils/apiUrl";
import {
  fieldMessage,
  validateConfirmPassword,
  validateEmail,
  validateNewPassword,
  validatePersonName,
  validatePhone,
  type ValidationCode,
} from "@/utils/validation";
import { useRouteAfterAuth } from "./useRouteAfterAuth";

/** The backend's most specific message: a field error before the generic one. */
const errorMessage = (data: any, fallback: string): string =>
  data?.errors?.[0]?.message || data?.message || fallback;

/** The three network actions behind the auth screen: password sign-in,
 * sending an OTP, and verifying it. Split out of useAuthFlow so both files
 * stay under 150 lines. */
export function useAuthActions({
  mode, phone, name, email, password, confirmPassword, otp, setOtp, setStep, otpRefs,
  onSwitchToSignUp, onAdvanceToOtp,
}: {
  mode: "signin" | "signup";
  phone: string;
  name: string;
  /** Required at sign-up: application review outcomes are emailed to it. */
  email: string;
  password: string;
  confirmPassword: string;
  otp: string[];
  setOtp: (v: string[]) => void;
  setStep: (v: "form" | "otp") => void;
  otpRefs: React.MutableRefObject<any[]>;
  /** Offer to switch to sign-up when the number has no account. */
  onSwitchToSignUp: () => void;
  /** Runs the slide when the screen advances to the OTP step. */
  onAdvanceToOtp: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { loginWithPassword } = useDriverStore();
  const routeAfterAuth = useRouteAfterAuth();
  const { t } = useTranslation();

  const handleSignIn = async () => {
    const phoneCode = validatePhone(phone);
    if (phoneCode) {
      Alert.alert(t("auth.invalidPhone"), fieldMessage(t, phoneCode));
      return;
    }
    if (!password) {
      Alert.alert(t("auth.passwordRequired"), t("auth.enterYourPassword"));
      return;
    }

    setLoading(true);
    try {
      await loginWithPassword(`+91${phone}`, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await routeAfterAuth();
    } catch (err: any) {
      const msg = err?.message || t("auth.loginFailed");
      if (msg.toLowerCase().includes("not found") || msg.toLowerCase().includes("sign up")) {
        Alert.alert(t("auth.accountNotFound"), t("auth.noAccountFoundWithThisNumber"), [
          { text: t("auth.signUp"), onPress: onSwitchToSignUp },
          { text: t("actions.cancel"), style: "cancel" },
        ]);
      } else {
        Alert.alert(t("auth.loginFailed"), msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Sign Up ──────────────────────────────────────────────────

  const handleSendOTP = async () => {
    // The first thing wrong, in the order the fields appear. The form shows the same messages inline.
    const problems: [string, ValidationCode | null][] = [
      [t("auth.nameRequired"), validatePersonName(name)],
      [t("auth.invalidEmailTitle", "Check your email"), validateEmail(email)],
      [t("auth.invalidPhone"), validatePhone(phone)],
      [t("auth.weakPassword"), validateNewPassword(password)],
      [t("auth.passwordsDontMatch"), validateConfirmPassword(password, confirmPassword)],
    ];
    const first = problems.find(([, code]) => code);
    if (first) {
      Alert.alert(first[0], fieldMessage(t, first[1]));
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const response = await fetch(`${apiUrl}/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${phone}`, email: email.trim().toLowerCase() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(errorMessage(data, t("auth.failedToSendOtp")));

      setStep("otp");
      onAdvanceToOtp();
    } catch (err: any) {
      Alert.alert(t("auth.errorTitle"), err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (enteredOtp?: string) => {
    const fullOtp = enteredOtp || otp.join("");
    if (fullOtp.length < 6) return;
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: `+91${phone}`,
          code: fullOtp,
          role: "DRIVER",
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(errorMessage(data, t("auth.verificationFailed")));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const { setAuthenticated } = useDriverStore.getState();
      setAuthenticated(data.user.name, data.user.phone, data.token, data.user.id || data.user._id);
      await routeAfterAuth();
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t("auth.invalidOtp"), err.message);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return { loading, handleSignIn, handleSendOTP, handleVerifyOTP };
}
