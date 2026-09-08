import { FlatList } from "react-native";
import { ChatEmptyState } from "./ChatEmptyState";

// Moved out of app/chat.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  activeChat: any;
  flatListRef: any;
  partnerLabel: any;
  renderItem: any;
  styles: any;
  tokens: any;
}

export function ChatBody({
  activeChat,
  flatListRef,
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
      ListEmptyComponent={
        <ChatEmptyState
          partnerLabel={partnerLabel}
          styles={styles}
          tokens={tokens}
        />
      }
    />
    </>
  );
}
