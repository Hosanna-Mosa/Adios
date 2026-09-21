import React from "react";

import { Feather } from "@expo/vector-icons";
import type { StyleProp, ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { Button } from "@/components/ui/Button";
import { styles } from "../auth.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import type { TextInput } from "react-native";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

interface Props {
  phone: string;
  otp: string[];
  otpRefs: React.MutableRefObject<(TextInput | null)[]>;
  mockOtp: string;
  loading: boolean;
  onOtpChange: (text: string, idx: number) => void;
  onKeyPress: (e: { nativeEvent: { key: string } }, idx: number) => void;
  onVerify: () => void;
  onResend: () => void;
  onBack: () => void;
  animatedStyle: StyleProp<ViewStyle>;
}

/** Six-box OTP entry step, shown after a sign-up sends a code. */
export function OtpForm({
  phone,
  otp,
  otpRefs,
  mockOtp,
  loading,
  onOtpChange,
  onKeyPress,
  onVerify,
  onResend,
  onBack,
  animatedStyle,
}: Props) {
  return (
    <AnimatedBox style={[styles.formSection, animatedStyle]}>
      <Touchable style={styles.backButton} onPress={onBack}>
        <Feather name="arrow-left" size={20} color={Colors.text} />
      </Touchable>

      <AppText style={styles.formTitle}>Verify Phone</AppText>
      <AppText style={styles.formSubtitle}>
        Enter the 6-digit code sent to{'\n'}+91 {phone}
      </AppText>
      <AppText style={styles.demoHint}>Demo OTP: {mockOtp}</AppText>

      <Box style={styles.otpContainer}>
        {otp.map((digit, idx) => (
          <AppTextInput
            key={idx}
            ref={(r) => { otpRefs.current[idx] = r; }}
            style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
            value={digit}
            onChangeText={(t) => onOtpChange(t.slice(-1), idx)}
            onKeyPress={(e) => onKeyPress(e, idx)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </Box>

      <Button
        title={loading ? "Creating account..." : "Verify & Create Account"}
        onPress={onVerify}
        loading={loading}
        disabled={otp.join("").length < 6}
        icon={!loading ? <Feather name="check" size={18} color={Colors.onBrand} /> : undefined}
        fullWidth
      />

      <Touchable style={styles.resendButton} onPress={onResend}>
        <AppText style={styles.resendText}>Resend OTP</AppText>
      </Touchable>
    </AnimatedBox>
  );
}
