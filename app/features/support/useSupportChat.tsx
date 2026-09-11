import { useSupportChatInsets } from "./useSupportChatInsets";
import { useSupportChatHandleCreateTicket } from "./useSupportChatHandleCreateTicket";
import { useSupportChatHandleSendMessage } from "./useSupportChatHandleSendMessage";
export { CATEGORIES } from "./useSupportChat.shared";

// State, data loading and handlers for app/support-chat.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

// the ones already seeded/expected by the admin dashboard's own icon
// matching (admin/src/pages/Support.tsx keys off "BILLING", "QUALITY", etc.
// in the category string), so they're kept exactly as-is rather than
// adopting the mockup's own wording, which would silently break that
// matching for every ticket raised from this screen.

export function useSupportChat() {
  const { insets, tokens, accent, styles, viewMode, setViewMode, loading, allTickets, setAllTickets, ticket, setTicket, inputText, setInputText, submittingReply, setSubmittingReply, newCategory, setNewCategory, newTitle, setNewTitle, newMessage, setNewMessage, creatingTicket, setCreatingTicket, flatListRef, fetchTickets } = useSupportChatInsets();
  const { handleCreateTicket } = useSupportChatHandleCreateTicket(setViewMode, setAllTickets, ticket, setTicket, newCategory, newTitle, setNewTitle, newMessage, setNewMessage, setCreatingTicket, flatListRef, fetchTickets);
  const { handleSendMessage, handleResolve, handleReopen } = useSupportChatHandleSendMessage(setViewMode, setAllTickets, ticket, setTicket, inputText, setInputText, setSubmittingReply, fetchTickets);

  return {
  insets, tokens, accent, styles, viewMode, setViewMode, loading, allTickets, ticket, setTicket,
  inputText, setInputText, submittingReply, newCategory, setNewCategory, newTitle, setNewTitle,
  newMessage, setNewMessage, creatingTicket, flatListRef, handleCreateTicket, handleSendMessage,
  handleResolve, handleReopen
  };
}

