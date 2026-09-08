import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import * as React from "react";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import { useSharedValue, useAnimatedStyle, withSpring, interpolate } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useDriverStore } from "@/store/driverStore";
import { SPRING } from "@/motion/presets";
import { AuthForm, OtpForm } from "@/features/auth/components";
import { styles } from "@/features/auth/auth.styles";
import { API_URL as apiUrl } from "@/utils/apiUrl";

const MOCK_OTP = "123456";

type AuthMode = "signin" | "signup";
type AuthStep = "form" | "otp";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [step, setStep] = useState<AuthStep>("form");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const otpRefs = React.useRef<(TextInput | null)[]>([]);
  const slideAnim = useSharedValue(0);
  const slideAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(slideAnim.value, [0, 1], [300, 0]) }],
  }));
  const { loginWithPassword, refreshSession } = useDriverStore();

  const routeAfterAuth = async () => {
    const sessionValid = await refreshSession();
    if (!sessionValid) {
      Alert.alert("Session expired", "Please sign in again.");
      return;
    }

    const { hasCompletedOnboarding } = useDriverStore.getState();
    router.replace(hasCompletedOnboarding ? "/(tabs)" : "/onboarding");
  };

  // ── Sign In ──────────────────────────────────────────────────

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
          { text: "Sign Up", onPress: () => setMode("signup") },
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
      slideAnim.value = withSpring(1, SPRING);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (text: string, idx: number) => {
    const newOtp = [...otp];
    newOtp[idx] = text;
    setOtp(newOtp);
    if (text && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
    if (idx === 5 && text) {
      const fullOtp = [...newOtp].join("");
      handleVerifyOTP(fullOtp);
    }
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }, idx: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
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

  const switchMode = (newMode: AuthMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setStep("form");
    setOtp(["", "", "", "", "", ""]);
    setPassword("");
    setConfirmPassword("");
    setName("");
  };

  // ── Render ───────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          styles.inner,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 40 : 10),
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Feather name="truck" size={moderateScale(40)} color={Colors.white} />
          </View>
          <Text style={styles.appName}>Flavour Driver</Text>
          <Text style={styles.tagline}>Driver Partner App</Text>
        </View>

        {step === "form" ? (
          <AuthForm
            mode={mode}
            onSwitchMode={switchMode}
            name={name}
            onNameChange={setName}
            phone={phone}
            onPhoneChange={setPhone}
            password={password}
            onPasswordChange={setPassword}
            confirmPassword={confirmPassword}
            onConfirmPasswordChange={setConfirmPassword}
            loading={loading}
            onSignIn={handleSignIn}
            onSendOTP={handleSendOTP}
          />
        ) : (
          <OtpForm
            phone={phone}
            otp={otp}
            otpRefs={otpRefs}
            mockOtp={MOCK_OTP}
            loading={loading}
            onOtpChange={handleOTPChange}
            onKeyPress={handleKeyPress}
            onVerify={() => handleVerifyOTP()}
            onResend={handleSendOTP}
            onBack={() => {
              setStep("form");
              setOtp(["", "", "", "", "", ""]);
            }}
            animatedStyle={slideAnimatedStyle}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
