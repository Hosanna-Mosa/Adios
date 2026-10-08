import { ActivityIndicator, Text } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { type ServiceTokens } from "@/constants/colors";
import { type OtpStyles } from "@/features/auth/otp.styles";

// Moved out of app/otp.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  handleResend: () => void;
  resending: any;
  secondsLeft: any;
  styles: OtpStyles;
}

export function OtpResendRow({
  accent,
  handleResend,
  resending,
  secondsLeft,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View style={styles.resendRow} entering={fadeInUp(280)}>
      {secondsLeft > 0 ? (
        <Text style={styles.resendMuted}>{t("app.auth.resendCodeIn0")}{String(secondsLeft).padStart(2, "0")}</Text>
      ) : (
        <TouchableOpacity onPress={handleResend} disabled={resending} activeOpacity={0.7}>
          {resending ? (
            <ActivityIndicator size="small" color={accent.accent} />
          ) : (
            <Text style={styles.resendActive}>{t("app.auth.resend")}</Text>
          )}
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}
