import React, { useEffect, useState } from "react";
import { Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { createStyles } from "./index.styles";
import { designTokens } from "@/constants/colors";
import { useAuthStore } from "@/contexts/authStore";
import { useThemeStore } from "@/contexts/themeStore";
import { showAlert } from "@/components/ui/AppAlert";

// State, data loading and handlers for app/index.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

export function useAuth() {
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
    });
  }, []);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const { loginWithPassword, requestOTP, loading, token, isInitialized } = useAuthStore();
  const { theme } = useThemeStore();
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
      showAlert("Error", "Please enter your phone number or email");
      return;
    }
    if (!password) {
      showAlert("Error", "Please enter your password");
      return;
    }

    try {
      await loginWithPassword(trimmed, password, "USER");
      // Token is now saved in AsyncStorage & store → navigate in
      router.replace("/(tabs)");
    } catch (error: any) {
      showAlert("Login Failed", error.message || "Failed to sign in. Please check your credentials.");
    }
  };

  const handleForgotPassword = () => {
    showAlert("Forgot Password", "Password recovery instructions will be sent to your account.");
  };

  const handleContinueWithOtp = async () => {
    const trimmed = identifier.trim();
    const digitsOnly = trimmed.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      showAlert("Phone number needed", "Enter your phone number above to continue with an OTP.");
      return;
    }
    setSendingOtp(true);
    try {
      await requestOTP(digitsOnly);
      router.push({ pathname: "/otp", params: { phone: digitsOnly } });
    } catch (error: any) {
      showAlert("Couldn't send code", error.message || "Please try again.");
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
