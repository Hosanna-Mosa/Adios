import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";

// Moved out of app/otp.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  handleResend: any;
  resending: any;
  secondsLeft: any;
  styles: any;
}

export function OtpResendRow({
  accent,
  handleResend,
  resending,
  secondsLeft,
  styles,
}: Props) {
  return (
    <Animated.View style={styles.resendRow} entering={fadeInUp(280)}>
      {secondsLeft > 0 ? (
        <Text style={styles.resendMuted}>Resend code in 0:{String(secondsLeft).padStart(2, "0")}</Text>
      ) : (
        <TouchableOpacity onPress={handleResend} disabled={resending} activeOpacity={0.7}>
          {resending ? (
            <ActivityIndicator size="small" color={accent.accent} />
          ) : (
            <Text style={styles.resendActive}>Resend</Text>
          )}
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}
