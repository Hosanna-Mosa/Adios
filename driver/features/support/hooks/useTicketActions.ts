import { useState } from "react";
import { Alert } from "react-native";
import type { SupportTicket } from "../types";

/** Creating a ticket and replying to one. Split out of useSupportChat so both
 * files stay under 150 lines. */
export function useTicketActions({
  supportFetch,
  fetchTickets,
  setTicket,
  setViewMode,
  newTitle, setNewTitle,
  newCategory,
  newMessage, setNewMessage,
  inputText, setInputText,
  ticket,
  setAllTickets,
}: any) {
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);

  const handleCreateTicket = async () => {
    if (!newTitle.trim() || !newMessage.trim()) {
      Alert.alert("Required fields", "Please fill in the summary and description");
      return;
    }

    setCreatingTicket(true);
    try {
      const created = await supportFetch("/support/tickets", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle.trim(),
          category: newCategory,
          message: newMessage.trim(),
        }),
      });
      setTicket(created);
      setAllTickets((prev: SupportTicket[]) => [created, ...prev]);
      setViewMode("chat");
      Alert.alert("Ticket Created", "Partner Support has received your case and will respond shortly.");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create support ticket");
    } finally {
      setCreatingTicket(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !ticket) return;

    const messageText = inputText.trim();
    setInputText("");
    setSubmittingReply(true);

    try {
      const updatedTicket = await supportFetch(`/support/tickets/${ticket._id}/messages`, {
        method: "POST",
        body: JSON.stringify({ text: messageText }),
      });
      setTicket(updatedTicket);
    } catch (error: any) {
      Alert.alert("Failed to send message", error.message || "Please try again.");
      setInputText(messageText); // restore text
    } finally {
      setSubmittingReply(false);
    }
  };

  return { creatingTicket, submittingReply, handleCreateTicket, handleSendMessage };
}
