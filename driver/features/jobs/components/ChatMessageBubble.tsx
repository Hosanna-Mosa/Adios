import React from "react";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../chat.styles";

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
    <View
      style={[
        styles.messageRow,
        isDriver ? styles.messageRowUser : styles.messageRowDriver,
      ]}
    >
      {!isDriver && (
        <View style={styles.driverAvatar}>
          <Feather name="user" size={14} color={Colors.textSecondary} />
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isDriver ? styles.bubbleUser : styles.bubbleDriver,
        ]}
      >
        <Text style={isDriver ? styles.bubbleTextUser : styles.bubbleTextDriver}>
          {message.text}
        </Text>
        <Text style={isDriver ? styles.timeUser : styles.timeDriver}>
          {message.time || ""}
        </Text>
      </View>
    </View>
  );
}
