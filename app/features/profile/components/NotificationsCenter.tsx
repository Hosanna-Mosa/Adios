import { ActivityIndicator, View } from "react-native";

// Moved out of app/notifications.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  styles: any;
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
