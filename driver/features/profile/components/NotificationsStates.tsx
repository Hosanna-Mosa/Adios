import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../notifications.styles";

/** Spinner while notifications load. */
export function NotificationsLoading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

/** Shown when there is nothing in the list. */
export function NotificationsEmpty({ message }: { message: string }) {
  return (
    <View style={styles.center}>
      <Feather name="bell-off" size={32} color={Colors.textMuted} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}
