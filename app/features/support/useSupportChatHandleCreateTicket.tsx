import { useEffect } from "react";
import { customFetch } from "@/utils/api/custom-fetch";
import { socketService } from "@/utils/socketService";
import { SupportTicket } from "./useSupportChat.shared";
import { showAlert } from "@/components/ui/AppAlert";

// Part 2 of useSupportChat, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

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
      showAlert("Missing details", "Add a title and a short description first.");
      return;
    }
    setCreatingTicket(true);
    try {
      const created = await customFetch<SupportTicket>("/support/tickets", {
        method: "POST",
        body: JSON.stringify({ title: newTitle.trim(), category: newCategory, message: newMessage.trim() }),
      });
      setAllTickets((prev: any) => [created, ...prev]);
      setTicket(created);
      setNewTitle("");
      setNewMessage("");
      setViewMode("chat");
    } catch (error: any) {
      showAlert("Couldn't submit", error.message || "Please try again.");
    } finally {
      setCreatingTicket(false);
    }
  };

  return { handleCreateTicket };
}
