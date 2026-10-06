import { Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import type { ServiceTokens, ThemeTokens } from "@/constants/colors";
import { fadeInUp } from "@/motion/presets";
import type { ChatMessage } from "@/types/models";
import type { SupportChatStyles } from "../support-chat.styles";

interface Props {
  item: ChatMessage;
  styles: SupportChatStyles;
  accent: ServiceTokens;
  tokens: ThemeTokens;
}

/** One chat line — the customer app's SupportMessageBubble. */
export function SupportMessageBubble({ item, styles, accent, tokens }: Props) {
  if (item.sender === "system") {
    return (
      <View style={styles.systemRow}>
        <Text style={styles.systemText}>{item.time}</Text>
      </View>
    );
  }
  const mine = item.sender === "user";
  return (
    <Animated.View entering={fadeInUp(0)} style={[styles.messageRow, { justifyContent: mine ? "flex-end" : "flex-start" }]}>
      {!mine ? (
        <View style={styles.avatar}>
          <Ionicons name="headset" size={13} color={accent.accent} />
        </View>
      ) : null}
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.bubbleText, { color: mine ? accent.on : tokens.text }]}>{item.text}</Text>
        <Text style={[styles.bubbleTime, { color: mine ? `${accent.on}B3` : tokens.sec }]}>{item.time}</Text>
      </View>
    </Animated.View>
  );
}
