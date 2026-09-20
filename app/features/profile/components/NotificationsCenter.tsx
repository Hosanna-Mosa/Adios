import { ActivityIndicator, View } from "react-native";
import { type ServiceTokens } from "@/constants/colors";
import { type NotificationsStyles } from "@/features/profile/notifications.styles";

// Moved out of app/notifications.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  styles: NotificationsStyles;
}

export function NotificationsCenter({
  accent,
  styles,
}: Props) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={accent.accent} />
    </View>
  );
}
