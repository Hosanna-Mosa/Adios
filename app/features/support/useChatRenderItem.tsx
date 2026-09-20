import { Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { fadeInUp } from "@/motion/presets";
import { ChatBubbleBody } from "./components/ChatBubbleBody";

// Part 3 of useChat, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useChatRenderItem(tokens: any, accent: any, styles: any) {
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isUser = item.sender === "customer";
    const showDateDivider = index === 0;
    return (
      <>
        {showDateDivider && <Text style={styles.dateDivider}>Today</Text>}
        <Animated.View entering={fadeInUp(0)} style={[styles.messageRow, isUser ? { justifyContent: "flex-end" } : { justifyContent: "flex-start" }]}>
          {!isUser && (
            <View style={styles.partnerAvatarSmall}>
              <Ionicons name="person" size={13} color={tokens.sec} />
            </View>
          )}
          <ChatBubbleBody
            isUser={isUser}
            item={item}
            accent={accent}
            styles={styles}
            tokens={tokens}
          />
        </Animated.View>
      </>
    );
  };

  return { renderItem };
}
