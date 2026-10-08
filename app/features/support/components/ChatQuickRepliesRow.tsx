import { ScrollView, Text } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { type ChatStyles } from "@/features/support/useChat.shared";

// Moved out of app/chat.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  QUICK_REPLIES: any[];
  sendMessage: any;
  styles: ChatStyles;
}

export function ChatQuickRepliesRow({
  QUICK_REPLIES,
  sendMessage,
  styles,
}: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRepliesRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
      {QUICK_REPLIES.map((item, idx) => (
        <Animated.View key={item} entering={staggerListItem(idx)}>
          <TouchableOpacity style={styles.quickReplyChip} onPress={() => sendMessage(item)}>
            <Text style={styles.quickReplyChipText}>{item}</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </ScrollView>
  );
}
