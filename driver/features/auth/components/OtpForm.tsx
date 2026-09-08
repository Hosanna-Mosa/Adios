import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import type { StyleProp, ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { Button } from "@/components/ui/Button";
import { styles } from "../auth.styles";

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
    <Animated.View style={[styles.formSection, animatedStyle]}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Feather name="arrow-left" size={20} color={Colors.text} />
      </TouchableOpacity>

      <Text style={styles.formTitle}>Verify Phone</Text>
      <Text style={styles.formSubtitle}>
        Enter the 6-digit code sent to{'\n'}+91 {phone}
      </Text>
      <Text style={styles.demoHint}>Demo OTP: {mockOtp}</Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, idx) => (
          <TextInput
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
      </View>

      <Button
        title={loading ? "Creating account..." : "Verify & Create Account"}
        onPress={onVerify}
        loading={loading}
        disabled={otp.join("").length < 6}
        icon={!loading ? <Feather name="check" size={18} color={Colors.onBrand} /> : undefined}
        fullWidth
      />

      <TouchableOpacity style={styles.resendButton} onPress={onResend}>
        <Text style={styles.resendText}>Resend OTP</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
