import { Text, View } from "react-native";

// Moved out of app/chat.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  item: any;
  isUser: any;
  accent: any;
  styles: any;
  tokens: any;
}

export function ChatBubbleBody({
  item,
  isUser,
  accent,
  styles,
  tokens,
}: Props) {
  return (
    <>
    <View style={[styles.bubble, isUser ? { backgroundColor: accent.accent, borderBottomRightRadius: 4 } : { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderBottomLeftRadius: 4 }]}>
      <Text style={[styles.bubbleText, { color: isUser ? accent.on : tokens.text }]}>{item.text}</Text>
      <Text style={[styles.bubbleTime, { color: isUser ? `${accent.on}B3` : tokens.sec, alignSelf: isUser ? "flex-end" : "flex-start" }]}>{item.timestamp}</Text>
    </View>
    </>
  );
}
