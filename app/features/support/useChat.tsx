import { useChatCurrentOrderId } from "./useChatCurrentOrderId";
import { useChatSendMessage } from "./useChatSendMessage";
import { useChatRenderItem } from "./useChatRenderItem";

// State, data loading and handlers for app/chat.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

export function useChat() {
  const { currentOrderId, driver, activeChat, addChatMessage, setUnreadCount, setIsChatActive, status, insets, tokens, isRide, isHelper, accent, partnerLabel, styles, inputText, setInputText, flatListRef, taskAssigned, handleAssignTask } = useChatCurrentOrderId();
  const { sendMessage } = useChatSendMessage(currentOrderId, driver, addChatMessage, setUnreadCount, setIsChatActive, setInputText, flatListRef);
  const { renderItem } = useChatRenderItem(tokens, accent, styles);

  return {
  driver, activeChat, status, insets, tokens, isRide, isHelper, accent, partnerLabel, styles,
  inputText, setInputText, flatListRef, taskAssigned, handleAssignTask, sendMessage, renderItem
  };
}

