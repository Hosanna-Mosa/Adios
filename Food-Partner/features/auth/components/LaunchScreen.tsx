import { View } from "react-native";
import Animated from "react-native-reanimated";
import { BrandMark } from "@/components/ui/BrandMark";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { useTokens } from "@/contexts/themeStore";
import { fadeIn } from "@/motion/presets";
import type { AuthStyles } from "../auth.styles";

/** Logo + spinner for the instant between the splash and the auth gate's redirect. */
export function LaunchScreen({ caption, styles }: { caption: string; styles: AuthStyles }) {
  const tokens = useTokens();
  return (
    <View style={styles.launch}>
      <Animated.View entering={fadeIn(0)}>
        <BrandMark size={84} wordmark caption={caption} />
      </Animated.View>
      <FullScreenLoader color={tokens.brand} size="small" />
    </View>
  );
}
