import React from "react";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../support-chat.styles";
import type { ChatMessage } from "../types";

/** One line in the support thread. System notes render centred and plain;
 * driver and agent messages sit on opposite sides. */
export function SupportMessageBubble({ message }: { message: ChatMessage }) {
  if (message.sender === "system") {
    return (
      <View style={styles.systemMessageContainer}>
        <Text style={[styles.systemMessageText, { color: Colors.textSecondary }]}>
          {message.time}
        </Text>
      </View>
    );
  }

  const isUser = message.sender === "user";
  return (
    <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAgent]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: Colors.primaryLight }]}>
          <Feather name="headphones" size={12} color={Colors.primary} />
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.bubbleUser, { backgroundColor: Colors.primary }]
            : [styles.bubbleAgent, { backgroundColor: Colors.surfaceAlt }],
        ]}
      >
        <Text style={isUser ? styles.bubbleTextUser : [styles.bubbleTextAgent, { color: Colors.text }]}>
          {message.text}
        </Text>
        <Text style={isUser ? styles.timeUser : [styles.timeAgent, { color: Colors.textMuted }]}>
          {message.time}
        </Text>
      </View>
    </View>
  );
}
