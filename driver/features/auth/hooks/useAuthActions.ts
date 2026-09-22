import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useDriverStore } from "@/store/driverStore";
import { API_URL as apiUrl } from "@/utils/apiUrl";
import { useRouteAfterAuth } from "./useRouteAfterAuth";

const MOCK_OTP = "123456";

/** The three network actions behind the auth screen: password sign-in,
 * sending an OTP, and verifying it. Split out of useAuthFlow so both files
 * stay under 150 lines. */
export function useAuthActions({
  mode, phone, name, password, confirmPassword, otp, setOtp, setStep, otpRefs,
  onSwitchToSignUp, onAdvanceToOtp,
}: {
  mode: "signin" | "signup";
  phone: string;
  name: string;
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
    if (phone.length < 10) {
      Alert.alert(t("auth.invalidPhone"), t("auth.pleaseEnterAValid10DigitPhone"));
      return;
    }
    if (!password) {
      Alert.alert(t("auth.passwordRequired"), t("auth.pleaseEnterYourPassword"));
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
    if (!name.trim()) {
      Alert.alert(t("auth.nameRequired"), t("auth.pleaseEnterYourFullName"));
      return;
    }
    if (phone.length < 10) {
      Alert.alert(t("auth.invalidPhone"), t("auth.pleaseEnterAValid10DigitPhone"));
      return;
    }
    if (!password) {
      Alert.alert(t("auth.passwordRequired"), t("auth.pleaseCreateAPassword"));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t("auth.weakPassword"), t("auth.passwordMustBeAtLeast6Characters"));
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t("auth.passwordsDontMatch"), t("auth.pleaseMakeSureBothPasswordsMatch"));
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const response = await fetch(`${apiUrl}/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${phone}` }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || t("auth.failedToSendOtp"));

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
          password,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || t("auth.verificationFailed"));

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

  return { loading, handleSignIn, handleSendOTP, handleVerifyOTP, MOCK_OTP };
}
