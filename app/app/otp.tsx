import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { router, useLocalSearchParams } from "expo-router";

import Animated from "react-native-reanimated";
import { createStyles } from "@/features/auth/otp.styles";
import { designTokens } from "@/constants/colors";
import { useAuthStore } from "@/contexts/authStore";
import { useThemeStore } from "@/contexts/themeStore";
import { Button } from "@/components/ui/Button";
import { fadeInUp } from "@/motion/presets";
import { OtpCallRow } from "@/features/auth/components/OtpCallRow";
import { OtpResendRow } from "@/features/auth/components/OtpResendRow";
import { OtpHeroBlock } from "@/features/auth/components/OtpHeroBlock";
import { OtpOtpRow } from "@/features/auth/components/OtpOtpRow";
import { OtpHeaderRow } from "@/features/auth/components/OtpHeaderRow";

const RESEND_SECONDS = 30;

function formatPhone(phone: string) {
  // "9849021734" -> "98490 21734"
  if (phone.length !== 10) return phone;
  return `${phone.slice(0, 5)} ${phone.slice(5)}`;
}

export default function OTPScreen() {
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
      Alert.alert("Verification failed", error.message || "That code didn't work. Please try again.");
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
      Alert.alert("Couldn't resend", error.message || "Please try again in a moment.");
    } finally {
      setResending(false);
    }
  };

  const handleCallInstead = () => {
    Alert.alert("Call requested", "We'll ring you with your code shortly.");
  };

  const isFilled = otp.every((d) => d.length === 1);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Back button — same treatment as screen 2 */}
      <OtpHeaderRow
        insets={insets}
        name={name}
        styles={styles}
        tokens={tokens}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { minHeight: "100%" }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Same centered hero treatment as screens 1 & 2 */}
        <OtpHeroBlock
          formatPhone={formatPhone}
          phone={phone}
          styles={styles}
        />

        <OtpOtpRow
          accent={accent}
          focusedIndex={focusedIndex}
          handleChange={handleChange}
          handleKeyPress={handleKeyPress}
          inputs={inputs}
          otp={otp}
          setFocusedIndex={setFocusedIndex}
          styles={styles}
        />

        <OtpResendRow
          accent={accent}
          handleResend={handleResend}
          resending={resending}
          secondsLeft={secondsLeft}
          styles={styles}
        />

        <Animated.View entering={fadeInUp(340)}>
          <Button
            title="Verify & continue"
            onPress={handleVerify}
            disabled={!isFilled}
            loading={loading}
            fullWidth
            style={{ marginTop: 24 }}
          />
        </Animated.View>

        <Animated.View entering={fadeInUp(400)}>
          <OtpCallRow
            handleCallInstead={handleCallInstead}
            styles={styles}
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
