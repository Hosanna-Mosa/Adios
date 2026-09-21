import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthBrandHeader, AuthForm, OtpForm } from "@/features/auth/components";
import { useAuthFlow } from "@/features/auth/hooks/useAuthFlow";
import { styles } from "@/features/auth/auth.styles";
import { Box } from "@/components/ui/Box";
import { KeyboardView } from "@/components/ui/KeyboardView";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const {
    mode, step, phone, setPhone, name, setName,
    password, setPassword, confirmPassword, setConfirmPassword,
    otp, setOtp, loading, otpRefs, slideAnimatedStyle,
    switchMode, setStep,
    handleSignIn, handleSendOTP, handleVerifyOTP,
    handleOTPChange, handleKeyPress,
    MOCK_OTP,
  } = useAuthFlow();

  return (
    <KeyboardView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Box
        style={[
          styles.inner,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 40 : 10),
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        <AuthBrandHeader appName="Flavour Driver" tagline="Driver Partner App" />

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
      </Box>
    </KeyboardView>
  );
}
