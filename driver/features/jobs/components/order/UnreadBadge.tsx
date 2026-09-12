import React from "react";
import { Text, View } from "react-native";
import { styles } from "../../active-order.styles";

/** Unread-message count on the chat button. */
export function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <View style={styles.commBadge}>
      <Text style={styles.commBadgeText}>{count}</Text>
    </View>
  );
}
