import { Alert } from "react-native";
import { customFetch } from "@/utils/api/custom-fetch";
import { SupportTicket } from "./useSupportChat.shared";

// Part 3 of useSupportChat, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useSupportChatHandleSendMessage(setViewMode: any, setAllTickets: any, ticket: any, setTicket: any, inputText: any, setInputText: any, setSubmittingReply: any, fetchTickets: any) {
  const handleSendMessage = async () => {
    if (!inputText.trim() || !ticket) return;
    const messageText = inputText.trim();
    setInputText("");
    setSubmittingReply(true);
    try {
      const updatedTicket = await customFetch<SupportTicket>(`/support/tickets/${ticket._id}/messages`, {
        method: "POST",
        body: JSON.stringify({ text: messageText }),
      });
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
      const updated = await customFetch<SupportTicket>(`/support/tickets/${ticket._id}/resolve`, {
        method: "POST",
        body: JSON.stringify({ approve }),
      });
      setTicket(updated);
      setAllTickets((prev: any) => prev.map((t: any) => (t._id === updated._id ? updated : t)));
    } catch (err: any) {
      Alert.alert("Error", err.message || "Please try again.");
    }
  };

  const handleReopen = async (t: SupportTicket) => {
    try {
      await customFetch(`/support/tickets/${t._id}/messages`, {
        method: "POST",
        body: JSON.stringify({ text: "Re-opening this case — I still need help with it." }),
      });
      await fetchTickets(true);
      setTicket(t);
      setViewMode("chat");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to reopen case");
    }
  };

  return { handleSendMessage, handleResolve, handleReopen };
}
