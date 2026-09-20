import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../support-chat.styles";
import type { ChatMessage } from "../types";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** One line in the support thread. System notes render centred and plain;
 * driver and agent messages sit on opposite sides. */
export function SupportMessageBubble({ message }: { message: ChatMessage }) {
  if (message.sender === "system") {
    return (
      <Box style={styles.systemMessageContainer}>
        <AppText style={[styles.systemMessageText, { color: Colors.textSecondary }]}>
          {message.time}
        </AppText>
      </Box>
    );
  }

  const isUser = message.sender === "user";
  return (
    <Box style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAgent]}>
      {!isUser && (
        <Box style={[styles.avatar, { backgroundColor: Colors.primaryLight }]}>
          <Feather name="headphones" size={12} color={Colors.primary} />
        </Box>
      )}
      <Box
        style={[
          styles.bubble,
          isUser
            ? [styles.bubbleUser, { backgroundColor: Colors.primary }]
            : [styles.bubbleAgent, { backgroundColor: Colors.surfaceAlt }],
        ]}
      >
        <AppText style={isUser ? styles.bubbleTextUser : [styles.bubbleTextAgent, { color: Colors.text }]}>
          {message.text}
        </AppText>
        <AppText style={isUser ? styles.timeUser : [styles.timeAgent, { color: Colors.textMuted }]}>
          {message.time}
        </AppText>
      </Box>
    </Box>
  );
}
