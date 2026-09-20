import { Text } from "react-native";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { router } from "expo-router";
import { type OtpStyles } from "@/features/auth/otp.styles";

// Moved out of app/otp.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  formatPhone: any;
  phone: string;
  styles: OtpStyles;
}

export function OtpHeroBlock({
  formatPhone,
  phone,
  styles,
}: Props) {
  return (
    <Animated.View style={styles.heroBlock} entering={fadeInUp(0)}>
      <Text style={styles.headline} numberOfLines={1}>Verify your number</Text>
      <Text style={styles.subhead}>
        We sent a 6-digit code to{" "}
        <Text style={styles.subheadStrong}>+91 {formatPhone(phone || "")}</Text>.{" "}
        <Text style={styles.subheadLink} onPress={() => router.back()}>
          Change
        </Text>
      </Text>
    </Animated.View>
  );
}
