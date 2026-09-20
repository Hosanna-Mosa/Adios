import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import type { ThemeTokens } from "@/constants/colors";
import type { ChatStyles } from "@/features/support/useChat.shared";

// The "keep it in the app, don't share your PIN" notice above the thread.
// Moved out of app/chat.tsx unchanged, including the wording that varies by
// service type.

interface Props {
  partnerLabel: string;
  isHelper: boolean;
  isRide: boolean;
  styles: ChatStyles;
  tokens: ThemeTokens;
}

export function ChatSafetyBanner({ partnerLabel, isHelper, isRide, styles, tokens }: Props) {
  return (
    <Animated.View entering={fadeInUp(60)} style={styles.safetyBanner}>
      <Ionicons name="shield-checkmark-outline" size={16} color={tokens.warning} />
      <Text style={styles.safetyText}>
        Keep the conversation in Flavour. Don&apos;t share your PIN with the {partnerLabel.toLowerCase()} before the {isHelper ? "task" : isRide ? "ride" : "order"} starts.
      </Text>
    </Animated.View>
  );
}
