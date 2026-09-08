import React, { useEffect, useState } from "react";
import { Alert, ActivityIndicator, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { router } from "expo-router";

import Reanimated from "react-native-reanimated";
import { createStyles } from "@/features/home/index.styles";
import { designTokens } from "@/constants/colors";
import { useAuthStore } from "@/contexts/authStore";
import { useThemeStore } from "@/contexts/themeStore";

import { ScreenShell } from "@/components/ui/ScreenShell";
import { LandingBody } from "@/features/home/components/LandingBody";
import { LandingLoadingBody } from "@/features/home/components/LandingLoadingBody";

export default function AuthScreen() {
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
      Alert.alert("Error", "Please enter your phone number or email");
      return;
    }
    if (!password) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    try {
      await loginWithPassword(trimmed, password, "USER");
      // Token is now saved in AsyncStorage & store → navigate in
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Failed to sign in. Please check your credentials.");
    }
  };

  const handleForgotPassword = () => {
    Alert.alert("Forgot Password", "Password recovery instructions will be sent to your account.");
  };

  const handleContinueWithOtp = async () => {
    const trimmed = identifier.trim();
    const digitsOnly = trimmed.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      Alert.alert("Phone number needed", "Enter your phone number above to continue with an OTP.");
      return;
    }
    setSendingOtp(true);
    try {
      await requestOTP(digitsOnly);
      router.push({ pathname: "/otp", params: { phone: digitsOnly } });
    } catch (error: any) {
      Alert.alert("Couldn't send code", error.message || "Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  // Show a loading indicator while auth state is being restored
  if (showSplash) {
    return (
      <Animated.View style={{
        flex: 1,
        backgroundColor: tokens.brand,
        justifyContent: "center",
        alignItems: "center",
        opacity: splashOpacity,
      }}>
        <LandingLoadingBody
          letters={letters}
          opacityAnim={opacityAnim}
          translateAnim={translateAnim}
        />
      </Animated.View>
    );
  }

  if (!isInitialized) {
    return (
      <ScreenShell style={{ justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={tokens.brand} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell keyboardAvoiding>
      <LandingBody
        Reanimated={Reanimated}
        handleContinueWithOtp={handleContinueWithOtp}
        handleForgotPassword={handleForgotPassword}
        handleSignIn={handleSignIn}
        identifier={identifier}
        insets={insets}
        isPasswordVisible={isPasswordVisible}
        loading={loading}
        password={password}
        sendingOtp={sendingOtp}
        setIdentifier={setIdentifier}
        setIsPasswordVisible={setIsPasswordVisible}
        setPassword={setPassword}
        styles={styles}
        tokens={tokens}
      />
    </ScreenShell>
  );
}
