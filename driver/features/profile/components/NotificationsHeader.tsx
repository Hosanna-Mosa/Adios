import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../notifications.styles";

/** Back, title, and the "Mark all read" action shown only when something is unread. */
export function NotificationsHeader({
  unreadCount,
  onBack,
  onMarkAllRead,
}: {
  unreadCount: number;
  onBack: () => void;
  onMarkAllRead: () => void;
}) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Feather name="arrow-left" size={20} color={Colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Notifications</Text>
      {unreadCount > 0 && (
        <TouchableOpacity onPress={onMarkAllRead}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
