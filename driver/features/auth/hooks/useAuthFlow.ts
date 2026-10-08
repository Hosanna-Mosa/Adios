import { useState } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
} from "react-native-reanimated";
import { SPRING } from "@/motion/presets";
import { useAuthActions } from "./useAuthActions";
import { useOtpInput } from "./useOtpInput";

export type AuthMode = "signin" | "signup";
export type AuthStep = "form" | "otp";

/** Everything the auth screen needs: which mode and step we're on, the field
 * values, and the actions. Composed from useOtpInput (the six boxes) and
 * useAuthActions (the network calls). */
export function useAuthFlow() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [step, setStep] = useState<AuthStep>("form");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const slideAnim = useSharedValue(0);
  const slideAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(slideAnim.value, [0, 1], [300, 0]) }],
  }));

  // The OTP boxes call back when the sixth digit lands; the actions hook owns
  // the verification, so the callback defers to it once it exists.
  const { otp, setOtp, otpRefs, handleOTPChange, handleKeyPress } = useOtpInput(
    (code) => actions.handleVerifyOTP(code),
  );

  const actions = useAuthActions({
    mode, phone, name, email, password, confirmPassword, otp, setOtp, setStep, otpRefs,
    onSwitchToSignUp: () => setMode("signup"),
    onAdvanceToOtp: () => {
      slideAnim.value = withSpring(1, SPRING);
    },
  });

  const switchMode = (newMode: AuthMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setStep("form");
    setOtp(["", "", "", "", "", ""]);
    setPassword("");
    setConfirmPassword("");
    setName("");
    setEmail("");
  };

  return {
    mode, step, phone, setPhone, name, setName, email, setEmail,
    password, setPassword, confirmPassword, setConfirmPassword,
    otp, setOtp, otpRefs, slideAnimatedStyle,
    switchMode, setStep,
    loading: actions.loading,
    handleSignIn: actions.handleSignIn,
    handleSendOTP: actions.handleSendOTP,
    handleVerifyOTP: actions.handleVerifyOTP,
    handleOTPChange, handleKeyPress,
  };
}
