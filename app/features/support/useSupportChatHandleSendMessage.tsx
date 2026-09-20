import { Alert } from "react-native";
import { SupportTicket } from "./useSupportChat.shared";
import { resolveTicket, sendTicketMessage } from "@/services/support.service";

// Split out of useSupportChat so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useSupportChatHandleSendMessage(setViewMode: any, setAllTickets: any, ticket: any, setTicket: any, inputText: any, setInputText: any, setSubmittingReply: any, fetchTickets: any) {
  const handleSendMessage = async () => {
    if (!inputText.trim() || !ticket) return;
    const messageText = inputText.trim();
    setInputText("");
    setSubmittingReply(true);
    try {
      const updatedTicket = await sendTicketMessage<SupportTicket>(ticket._id, messageText);
      setTicket(updatedTicket);
    } catch (error: any) {
      Alert.alert("Message not sent", error.message || "Please try again.");
      setInputText(messageText);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleResolve = async (approve: boolean) => {
    if (!ticket) return;
    try {
      const updated = await resolveTicket<SupportTicket>(ticket._id, approve);
      setTicket(updated);
      setAllTickets((prev: any) => prev.map((t: any) => (t._id === updated._id ? updated : t)));
    } catch (err: any) {
      Alert.alert("Error", err.message || "Please try again.");
    }
  };

  const handleReopen = async (t: SupportTicket) => {
    try {
      await sendTicketMessage(t._id, "Re-opening this case — I still need help with it.");
      await fetchTickets(true);
      setTicket(t);
      setViewMode("chat");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to reopen case");
    }
  };

  return { handleSendMessage, handleResolve, handleReopen };
}
