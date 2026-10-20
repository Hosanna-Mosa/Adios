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
import { useLanguageStore } from "@/contexts/languageStore";
import { showAlert } from "@/components/ui/AppAlert";
import { useIntroSplash } from "./useIntroSplash";

// State, data loading and handlers for app/index.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

export function useAuth() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // The intro splash (see useIntroSplash). When it finishes, the routing gate
  // in app/_layout.tsx may redirect (to select-language, login, or tabs)
  // without cutting the animation short.
  const [showSplash, setShowSplash] = useState(true);
  const splashOpacity = React.useRef(new Animated.Value(1)).current;
  const introAnims = useIntroSplash(() => {
    setIntroPlayed(true);
    useIntroSplashStore.getState().setIntroSplashDone();
  });
  const [introPlayed, setIntroPlayed] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const loginWithPassword = useAuthStore((s) => s.loginWithPassword);
  const loading = useAuthStore((s) => s.loading);
  const token = useAuthStore((s) => s.token);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const accent = { accent: tokens.brand, skin: tokens.brandSkin, on: tokens.onBrand };
  const styles = React.useMemo(() => createStyles(tokens, accent), [theme]);

  // The splash stays up (brand colour, no fade) whenever the routing gate is
  // about to replace this screen — a restored session going to /(tabs), or the
  // language gate. Fading it out first uncovered the white root view and a
  // loader, which was the white screen between the splash and Home. It only
  // fades when this screen's own login form is what comes next.
  const languageConfirmed = useLanguageStore((s) => s.languageConfirmed);
  useEffect(() => {
    if (!introPlayed || !showSplash || !isInitialized || token || !languageConfirmed) return;
    Animated.timing(splashOpacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setShowSplash(false));
  }, [introPlayed, showSplash, isInitialized, token, languageConfirmed, splashOpacity]);

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

  // Show a loading indicator while auth state is being restored

  return {
  insets, showSplash, splashOpacity, introAnims, identifier,
  setIdentifier, password, setPassword, isPasswordVisible, setIsPasswordVisible,
  loading, isInitialized, tokens, styles, handleSignIn, handleForgotPassword
  };
}
