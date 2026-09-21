import { useEffect } from "react";
import { Alert } from "react-native";
import { socketService } from "@/utils/socketService";
import { SupportTicket } from "./useSupportChat.shared";
import i18n from "@/i18n";
import { createSupportTicket } from "@/services/support.service";

// Split out of useSupportChat so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useSupportChatHandleCreateTicket(setViewMode: any, setAllTickets: any, ticket: any, setTicket: any, newCategory: any, newTitle: any, setNewTitle: any, newMessage: any, setNewMessage: any, setCreatingTicket: any, flatListRef: any, fetchTickets: any) {
  useEffect(() => {
    fetchTickets(true);
    socketService.connect();
    const handleTicketUpdate = (updatedTicket: any) => {
      setTicket((prev: any) => (prev && prev._id === updatedTicket._id ? updatedTicket : prev));
      setAllTickets((prev: any) => prev.map((t: any) => (t._id === updatedTicket._id ? updatedTicket : t)));
    };
    socketService.on("ticket_updated", handleTicketUpdate);
    const interval = setInterval(() => fetchTickets(false), 4000);
    return () => {
      clearInterval(interval);
      socketService.off("ticket_updated", handleTicketUpdate);
    };
  }, []);

  useEffect(() => {
    if (ticket && ticket.messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
    }
  }, [ticket?.messages?.length]);

  const handleCreateTicket = async () => {
    if (!newTitle.trim() || !newMessage.trim()) {
      Alert.alert(i18n.t("app.delivery.missingDetails"), i18n.t("app.support.addATitleAndAShort"));
      return;
    }
    setCreatingTicket(true);
    try {
      const created = await createSupportTicket<SupportTicket>({ title: newTitle.trim(), category: newCategory, message: newMessage.trim() });
      setAllTickets((prev: any) => [created, ...prev]);
      setTicket(created);
      setNewTitle("");
      setNewMessage("");
      setViewMode("chat");
    } catch (error: any) {
      Alert.alert(i18n.t("app.ride.couldntSubmit"), error.message || i18n.t("app.ride.pleaseTryAgain"));
    } finally {
      setCreatingTicket(false);
    }
  };

  return { handleCreateTicket };
}
