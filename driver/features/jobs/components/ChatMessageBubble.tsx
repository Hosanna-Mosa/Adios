import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../chat.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

export interface ChatMessage {
  id?: string;
  text: string;
  from: string;
  time?: string;
}

/** One message row in the customer chat. Driver messages sit right, the
 * customer's sit left behind an avatar. */
export function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isDriver = message.from === "driver";

  return (
    <Box
      style={[
        styles.messageRow,
        isDriver ? styles.messageRowUser : styles.messageRowDriver,
      ]}
    >
      {!isDriver && (
        <Box style={styles.driverAvatar}>
          <Feather name="user" size={14} color={Colors.textSecondary} />
        </Box>
      )}
      <Box
        style={[
          styles.bubble,
          isDriver ? styles.bubbleUser : styles.bubbleDriver,
        ]}
      >
        <AppText style={isDriver ? styles.bubbleTextUser : styles.bubbleTextDriver}>
          {message.text}
        </AppText>
        <AppText style={isDriver ? styles.timeUser : styles.timeDriver}>
          {message.time || ""}
        </AppText>
      </Box>
    </Box>
  );
}
