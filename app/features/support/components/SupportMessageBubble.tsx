import { Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { type ThemeTokens } from "@/constants/colors";
import { fadeInUp } from "@/motion/presets";
import { type SupportChatStyles } from "@/features/support/support-chat.styles";

// Moved out of app/support-chat.tsx. The JSX is unchanged; what it used to read from the
// screen's scope is now passed in as props.

export interface ChatMessage {
  sender: "user" | "admin" | "system";
  time: string;
  text: string;
}

interface Props {
  item: ChatMessage;
  styles: SupportChatStyles;
  accent: { accent: string; skin: string; on: string };
  tokens: ThemeTokens;
}

export function SupportMessageBubble({ item, styles, accent, tokens }: Props) {
  if (item.sender === "system") {
    return (
      <View style={{ alignItems: "center", marginVertical: 8 }}>
        <Text style={styles.systemMessageText}>{item.time}</Text>
      </View>
    );
  }
  const isUser = item.sender === "user";
  return (
    <Animated.View entering={fadeInUp(0)} style={[styles.messageRow, { justifyContent: isUser ? "flex-end" : "flex-start" }]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Ionicons name="headset" size={13} color={accent.accent} />
        </View>
      )}
      <View style={[styles.bubble, isUser ? { backgroundColor: accent.accent, borderBottomRightRadius: 4 } : { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderBottomLeftRadius: 4 }]}>
        <Text style={[styles.bubbleText, { color: isUser ? accent.on : tokens.text }]}>{item.text}</Text>
        <Text style={[styles.bubbleTime, { color: isUser ? `${accent.on}B3` : tokens.sec }]}>{item.time}</Text>
      </View>
    </Animated.View>
  );
}
