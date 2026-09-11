import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import Animated from "react-native-reanimated";
import { Button } from "@/components/ui/Button";
import { fadeInUp } from "@/motion/presets";
import { OtpCallRow } from "@/features/auth/components/OtpCallRow";
import { OtpResendRow } from "@/features/auth/components/OtpResendRow";
import { OtpHeroBlock } from "@/features/auth/components/OtpHeroBlock";
import { OtpRow } from "@/features/auth/components/OtpRow";
import { OtpHeaderRow } from "@/features/auth/components/OtpHeaderRow";
import { useOTP } from "@/features/auth/useOTP";

export default function OTPScreen() {
  const {
  insets, phone, name, otp, focusedIndex, setFocusedIndex, secondsLeft, resending, inputs,
  loading, tokens, accent, styles, handleChange, handleKeyPress, handleVerify, handleResend,
  handleCallInstead, isFilled
  } = useOTP();

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

        <OtpRow
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

function formatPhone(phone: string) {
  // "9849021734" -> "98490 21734"
  if (phone.length !== 10) return phone;
  return `${phone.slice(0, 5)} ${phone.slice(5)}`;
}
