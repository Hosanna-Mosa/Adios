import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { BrandMark } from "@/components/ui/BrandMark";
import { fadeInUp } from "@/motion/presets";
import type { AuthStyles } from "../auth.styles";

interface Props {
  title: string;
  subtitle: string;
  icon?: keyof typeof Ionicons.glyphMap;
  styles: AuthStyles;
}

/** Logo + heading at the top of the sign-in and password-reset screens. */
export function AuthHero({ title, subtitle, icon, styles }: Props) {
  return (
    <Animated.View entering={fadeInUp(0)} style={styles.hero}>
      <BrandMark size={72} icon={icon} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </Animated.View>
  );
}
