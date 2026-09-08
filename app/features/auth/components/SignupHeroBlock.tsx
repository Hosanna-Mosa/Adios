import { Text } from "react-native";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";

// Moved out of app/signup.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  styles: any;
}

export function SignupHeroBlock({
  styles,
}: Props) {
  return (
    <Animated.View style={styles.heroBlock} entering={fadeInUp(0)}>
      <Text style={styles.headline} numberOfLines={1}>Create your account</Text>
      <Text style={styles.subhead}>
        Takes about a minute. We&apos;ll verify your phone with an OTP.
      </Text>
    </Animated.View>
  );
}
