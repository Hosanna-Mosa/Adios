import type { RefObject } from "react";
import { FlatList } from "react-native";
import type { ServiceTokens, ThemeTokens } from "@/constants/colors";
import type { ChatMessage } from "@/types/models";
import type { SupportChatStyles } from "../support-chat.styles";
import { SupportMessageBubble } from "./SupportMessageBubble";

interface Props {
  messages: ChatMessage[];
  listRef: RefObject<FlatList<ChatMessage> | null>;
  styles: SupportChatStyles;
  accent: ServiceTokens;
  tokens: ThemeTokens;
}

/** The conversation, scrolled to the latest message. */
export function SupportMessages({ messages, listRef, styles, accent, tokens }: Props) {
  return (
    <FlatList
      ref={listRef}
      style={styles.messages}
      data={messages}
      keyExtractor={(_, index) => String(index)}
      renderItem={({ item }) => <SupportMessageBubble item={item} styles={styles} accent={accent} tokens={tokens} />}
      contentContainerStyle={styles.messagesList}
      showsVerticalScrollIndicator={false}
      onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
    />
  );
}
