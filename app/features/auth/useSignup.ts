import { useCallback, useEffect, useMemo, useState } from "react";
import { BackHandler, Platform, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { createStyles } from "./signup.styles";
import { designTokens } from "@/constants/colors";
import { useAuthStore } from "@/contexts/authStore";
import { useThemeStore } from "@/contexts/themeStore";

// State, data loading and handlers for app/signup.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

export type PasswordStrength = "empty" | "weak" | "fair" | "good";
function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return "empty";
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[0-9]/.test(password) && /[a-zA-Z]/.test(password)) score++;
  if (score <= 1) return "weak";
  if (score === 2) return "fair";
  return "good";
}

export function useSignup() {
  const insets = useSafeAreaInsets();
  const { phone: prefillPhone } = useLocalSearchParams<{ phone: string }>();

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(prefillPhone || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const requestOTP = useAuthStore((s) => s.requestOTP);
  const loading = useAuthStore((s) => s.loading);
  const token = useAuthStore((s) => s.token);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const accent = { accent: tokens.brand, skin: tokens.brandSkin, on: tokens.onBrand };
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);

  const isPhoneDisabled = !!prefillPhone;
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  // Guard: already logged-in users should not see signup
  useEffect(() => {
    if (isInitialized && token) {
      router.replace("/(tabs)");
    }
  }, [isInitialized, token]);

  // Anything the user actually typed. The phone is pre-filled and locked when
  // this screen is reached from the OTP screen, so it doesn't count as entered.
  const hasEnteredDetails =
    !!name || !!email || !!password || agreedToTerms || (!prefillPhone && !!phoneNumber);

  // Never router.back() here: this screen is reached with a replace from both
  // the sign-in screen and the OTP screen, so "back" would either dead-end or
  // drop the user onto a spent OTP screen.
  const leaveSignup = useCallback(() => {
    router.replace("/login");
  }, []);

  const handleBack = useCallback(() => {
    if (!hasEnteredDetails) {
      leaveSignup();
      return;
    }
    Alert.alert(
      "Discard sign up?",
      "Your details won't be saved.",
      [
        { text: "Keep editing", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: leaveSignup },
      ],
      { cancelable: true }
    );
  }, [hasEnteredDetails, leaveSignup]);

  // Android hardware back has to hit the same confirmation as the header arrow
  // instead of silently popping back into the auth flow (or exiting the app).
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android") return;
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        handleBack();
        return true;
      });
      return () => sub.remove();
    }, [handleBack])
  );

  const handleRegister = async () => {
    if (name.trim().length < 3) {
      Alert.alert("Invalid Name", "Please enter your full name (minimum 3 characters).");
      return;
    }
    if (!phoneNumber || phoneNumber.trim().length < 10) {
      Alert.alert("Invalid Phone", "Please enter a valid phone number.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Invalid Password", "Password must be at least 8 characters long.");
      return;
    }
    if (!agreedToTerms) {
      Alert.alert("Terms & Privacy Policy", "Please agree to the Terms and Privacy Policy to continue.");
      return;
    }

    try {
      // The account isn't created here — a real OTP has to verify the phone
      // first. verifyOTP on the next screen carries name/email/password
      // through and creates the account once the code checks out.
      const trimmedPhone = phoneNumber.trim();
      await requestOTP(trimmedPhone);
      router.push({
        pathname: "/otp",
        params: { phone: trimmedPhone, name: name.trim(), email: email.trim(), password },
      });
    } catch (error: any) {
      Alert.alert("Couldn't send code", error.message || "Something went wrong. Please try again.");
    }
  };

  const canSubmit = !!name && !!phoneNumber && !!email && !!password && agreedToTerms && !loading;


  return {
  insets, name, setName, phoneNumber, setPhoneNumber, email, setEmail, password, setPassword,
  isPasswordVisible, setIsPasswordVisible, agreedToTerms, setAgreedToTerms, loading, tokens,
  accent, styles, isPhoneDisabled, passwordStrength, handleBack, handleRegister, canSubmit
  };
}
