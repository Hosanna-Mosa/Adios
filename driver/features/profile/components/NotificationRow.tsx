import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../notifications.styles";
import { CATEGORY_ICON, formatWhen } from "../utils/notifications";
import type { NotificationItem } from "../utils/notifications";

/** One notification: category icon, title with unread dot, body, and age. */
export function NotificationRow({
  item,
  onPress,
}: {
  item: NotificationItem;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, !item.isRead && styles.rowUnread]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={[styles.rowIcon, { backgroundColor: item.isRead ? Colors.surfaceAlt : Colors.primaryLight }]}>
        <Feather
          name={CATEGORY_ICON[item.category] || "bell"}
          size={16}
          color={item.isRead ? Colors.textSecondary : Colors.primaryDark}
        />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={[styles.rowTitle, !item.isRead && styles.rowTitleUnread]} numberOfLines={1}>
            {item.title}
          </Text>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.rowBody} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.rowTime}>{formatWhen(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}
