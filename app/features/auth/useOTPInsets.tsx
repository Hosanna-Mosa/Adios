import { useEffect, useMemo, useRef, useState } from "react";
import { TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { createStyles } from "./otp.styles";
import { designTokens } from "@/constants/colors";
import { useAuthStore } from "@/contexts/authStore";
import { useThemeStore } from "@/contexts/themeStore";
import { RESEND_SECONDS } from "./useOTP.shared";

// Part 1 of useOTP, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useOTPInsets() {
  const insets = useSafeAreaInsets();
  // name/email/password are only present when this screen was reached from
  // the create-account form — carrying them through lets verifyOTP finish
  // registration as soon as the real code checks out, instead of the old
  // flow where "Create account" skipped OTP verification entirely.
  const { phone, name, email, password } = useLocalSearchParams<{
    phone: string;
    name?: string;
    email?: string;
    password?: string;
  }>();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);

  const { verifyOTP, requestOTP, loading } = useAuthStore();
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = { accent: tokens.brand, skin: tokens.brandSkin, on: tokens.onBrand };
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleChange = (text: string, index: number) => {
    // A clipboard paste can carry spaces and an SMS autofill can hand over more
    // than the bare code, so only the digits matter here.
    const digits = text.replace(/[^0-9]/g, "");

    // Code-length or longer means a paste or a whole-code autofill: it fills the
    // row from the first box no matter which one received it, and parks the
    // caret on the last box so backspace still works.
    if (digits.length >= otp.length) {
      setOtp(digits.slice(0, otp.length).split(""));
      const last = otp.length - 1;
      inputs.current[last]?.focus();
      setFocusedIndex(last);
      return;
    }

    // The boxes no longer cap input at one character, so a keystroke typed into
    // an already-filled box arrives as "old + new" — drop the old digit so it
    // still reads as a replacement.
    const previous = otp[index];
    const incoming =
      previous && digits.length > 1 && digits.startsWith(previous)
        ? digits.slice(previous.length)
        : digits;

    // A short paste (a partial code) spreads forward from this box.
    if (incoming.length > 1) {
      const next = [...otp];
      for (let i = 0; i < incoming.length && index + i < next.length; i++) {
        next[index + i] = incoming[i];
      }
      setOtp(next);
      const last = Math.min(index + incoming.length, next.length) - 1;
      inputs.current[last]?.focus();
      setFocusedIndex(last);
      return;
    }

    const digit = incoming;
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  return { insets, phone, name, email, password, otp, setOtp, focusedIndex, setFocusedIndex, secondsLeft, setSecondsLeft, resending, setResending, inputs, verifyOTP, requestOTP, loading, tokens, accent, styles, handleChange };
}
