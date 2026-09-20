import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import type { ThemeTokens } from "@/constants/colors";
import type { NotificationsStyles } from "@/features/profile/notifications.styles";

// Shown when the list comes back empty. Moved out of app/notifications.tsx
// unchanged.

interface Props {
  styles: NotificationsStyles;
  tokens: ThemeTokens;
}

export function NotificationsEmptyState({ styles, tokens }: Props) {
  return (
    <Animated.View style={styles.center} entering={fadeInUp(0)}>
      <Ionicons name="notifications-off-outline" size={32} color={tokens.muted} />
      <Text style={styles.emptyText}>Nothing here yet. Order and account updates will show up in this list.</Text>
    </Animated.View>
  );
}
