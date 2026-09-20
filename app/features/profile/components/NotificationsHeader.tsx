import { Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInDown } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/notifications.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  handleMarkAllRead: any;
  styles: any;
  tokens: any;
  unreadCount: any;
}

export function NotificationsHeader({
  handleMarkAllRead,
  styles,
  tokens,
  unreadCount,
}: Props) {
  return (
    <Animated.View style={styles.header} entering={fadeInDown(0)}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Notifications</Text>
      {unreadCount > 0 && (
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}
