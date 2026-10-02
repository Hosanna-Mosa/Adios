import React, { useEffect, useState } from "react";
import { Animated } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { createStyles } from "./index.styles";
import { designTokens } from "@/constants/colors";
import { useAuthStore } from "@/contexts/authStore";
import { useThemeStore } from "@/contexts/themeStore";
import { useIntroSplashStore } from "@/contexts/introSplashStore";
import { showAlert } from "@/components/ui/AppAlert";

// State, data loading and handlers for app/index.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

export function useAuth() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Arrival Animation States for "FLAVOUR"
  const [showSplash, setShowSplash] = useState(true);
  const splashOpacity = React.useRef(new Animated.Value(1)).current;
  const letters = ["F", "L", "A", "V", "O", "U", "R"];
  const translateAnim = React.useRef(letters.map(() => new Animated.Value(0))).current;
  const opacityAnim = React.useRef(letters.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Set up spring arrival animations from opposite vertical directions
    const animations = letters.map((_, idx) => {
      const isOdd = idx % 2 !== 0;
      translateAnim[idx].setValue(isOdd ? -450 : 450);
      opacityAnim[idx].setValue(0);

      return Animated.parallel([
        Animated.spring(translateAnim[idx], {
          toValue: 0,
          tension: 40,
          friction: 6.5,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim[idx], {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        })
      ]);
    });

    Animated.sequence([
      Animated.delay(200),
      Animated.stagger(120, animations),
      Animated.delay(1200), // Let the complete name rest in the center
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowSplash(false);
      // Lets app/_layout.tsx's routing gate know the splash has fully played,
      // so it can safely redirect (to select-language, login, or tabs)
      // without cutting this animation short.
      useIntroSplashStore.getState().setIntroSplashDone();
    });
  }, []);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const loginWithPassword = useAuthStore((s) => s.loginWithPassword);
  const requestOTP = useAuthStore((s) => s.requestOTP);
  const loading = useAuthStore((s) => s.loading);
  const token = useAuthStore((s) => s.token);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const accent = { accent: tokens.brand, skin: tokens.brandSkin, on: tokens.onBrand };
  const styles = React.useMemo(() => createStyles(tokens, accent), [theme]);

  // Guard: if a token already exists, skip straight to the app.
  // This handles the edge case where the user navigates back to "/" while still logged in.
  useEffect(() => {
    if (!showSplash && isInitialized && token) {
      router.replace("/(tabs)");
    }
  }, [showSplash, isInitialized, token]);

  const handleSignIn = async () => {
    const trimmed = identifier.trim();
    if (!trimmed) {
      showAlert(t("actions.error"), t("app.home.pleaseEnterYourPhoneNumberOr"));
      return;
    }
    if (!password) {
      showAlert(t("actions.error"), t("app.home.pleaseEnterYourPassword"));
      return;
    }

    try {
      await loginWithPassword(trimmed, password, "USER");
      // Token is now saved in AsyncStorage & store → navigate in
      router.replace("/(tabs)");
    } catch (error: any) {
      showAlert(t("app.home.loginFailed"), error.message || t("app.home.failedToSignInPleaseCheck"));
    }
  };

  const handleForgotPassword = () => {
    showAlert(t("app.home.forgotPassword"), t("app.home.passwordRecoveryInstructionsWillBeSent"));
  };

  const handleContinueWithOtp = async () => {
    const trimmed = identifier.trim();
    const digitsOnly = trimmed.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      showAlert(t("app.home.phoneNumberNeeded"), t("app.home.enterYourPhoneNumberAboveTo"));
      return;
    }
    setSendingOtp(true);
    try {
      await requestOTP(digitsOnly);
      router.push({ pathname: "/otp", params: { phone: digitsOnly } });
    } catch (error: any) {
      showAlert(t("app.auth.couldntSendCode"), error.message || t("app.ride.pleaseTryAgain"));
    } finally {
      setSendingOtp(false);
    }
  };

  // Show a loading indicator while auth state is being restored

  return {
  insets, showSplash, splashOpacity, letters, translateAnim, opacityAnim, identifier,
  setIdentifier, password, setPassword, isPasswordVisible, setIsPasswordVisible, sendingOtp,
  loading, isInitialized, tokens, styles, handleSignIn, handleForgotPassword,
  handleContinueWithOtp
  };
}
