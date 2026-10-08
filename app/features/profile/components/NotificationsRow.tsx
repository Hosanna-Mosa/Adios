import { Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { Ionicons } from "@expo/vector-icons";
import { fontFamilies } from "@/constants/typography";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type NotificationsStyles } from "@/features/profile/notifications.styles";

// Moved out of app/notifications.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  item: any;
  formatWhen: any;
  CATEGORY_ICON: any;
  accent: ServiceTokens;
  handleOpen: any;
  styles: NotificationsStyles;
  tokens: ThemeTokens;
}

export function NotificationsRow({
  item,
  formatWhen,
  CATEGORY_ICON,
  accent,
  handleOpen,
  styles,
  tokens,
}: Props) {
  return (
    <TouchableOpacity style={[styles.row, !item.isRead && { borderColor: accent.accent, backgroundColor: accent.skin }]} activeOpacity={0.8} onPress={() => handleOpen(item)}>
      <View style={[styles.rowIcon, { backgroundColor: item.isRead ? tokens.sunken : tokens.surface }]}>
        <Ionicons name={CATEGORY_ICON[item.category] || "notifications"} size={16} color={item.isRead ? tokens.sec : accent.accent} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={[styles.rowTitle, !item.isRead && { fontFamily: fontFamilies.body.bold }]} numberOfLines={1}>{item.title}</Text>
          {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: accent.accent }]} />}
        </View>
        <Text style={styles.rowBody} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.rowTime}>{formatWhen(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}
