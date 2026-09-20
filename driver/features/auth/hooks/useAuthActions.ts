import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Alert } from "react-native";
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

  const handleSignIn = async () => {
    if (phone.length < 10) {
      Alert.alert("Invalid Phone", "Please enter a valid 10-digit phone number");
      return;
    }
    if (!password) {
      Alert.alert("Password Required", "Please enter your password");
      return;
    }

    setLoading(true);
    try {
      await loginWithPassword(`+91${phone}`, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await routeAfterAuth();
    } catch (err: any) {
      const msg = err?.message || "Login failed";
      if (msg.toLowerCase().includes("not found") || msg.toLowerCase().includes("sign up")) {
        Alert.alert("Account Not Found", "No account found with this number. Please sign up first.", [
          { text: "Sign Up", onPress: onSwitchToSignUp },
          { text: "Cancel", style: "cancel" },
        ]);
      } else {
        Alert.alert("Login Failed", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Sign Up ──────────────────────────────────────────────────

  const handleSendOTP = async () => {
    if (!name.trim()) {
      Alert.alert("Name Required", "Please enter your full name");
      return;
    }
    if (phone.length < 10) {
      Alert.alert("Invalid Phone", "Please enter a valid 10-digit phone number");
      return;
    }
    if (!password) {
      Alert.alert("Password Required", "Please create a password");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords Don't Match", "Please make sure both passwords match");
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
      if (!response.ok) throw new Error(data.message || "Failed to send OTP");

      setStep("otp");
      onAdvanceToOtp();
    } catch (err: any) {
      Alert.alert("Error", err.message);
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
      if (!response.ok) throw new Error(data.message || "Verification failed");

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const { setAuthenticated } = useDriverStore.getState();
      setAuthenticated(data.user.name, data.user.phone, data.token, data.user.id || data.user._id);
      await routeAfterAuth();
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Invalid OTP", err.message);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return { loading, handleSignIn, handleSendOTP, handleVerifyOTP, MOCK_OTP };
}
