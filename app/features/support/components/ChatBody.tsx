import { ActivityIndicator, FlatList, View } from "react-native";
import { ChatEmptyState } from "./ChatEmptyState";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type ChatStyles } from "@/features/support/useChat.shared";

// Moved out of app/chat.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  activeChat: any;
  accent: ServiceTokens;
  flatListRef: any;
  loadingHistory: boolean;
  partnerLabel: string;
  renderItem: any;
  styles: ChatStyles;
  tokens: ThemeTokens;
}

export function ChatBody({
  activeChat,
  accent,
  flatListRef,
  loadingHistory,
  partnerLabel,
  renderItem,
  styles,
  tokens,
}: Props) {
  return (
    <>
    <FlatList
      ref={flatListRef}
      style={styles.messagesFlatList}
      data={activeChat}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.messagesList}
      showsVerticalScrollIndicator={false}
      onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      ListEmptyComponent={
        // "No messages yet" is only true once the stored thread has been read.
        loadingHistory ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color={accent.accent} />
          </View>
        ) : (
          <ChatEmptyState
            partnerLabel={partnerLabel}
            styles={styles}
            tokens={tokens}
          />
        )
      }
    />
    </>
  );
}
