import { useEffect } from "react";
import { usePolling } from "@/utils/usePolling";
import { SupportTicket } from "./useSupportChat.shared";
import i18n from "@/i18n";
import { createSupportTicket } from "@/services/support.service";
import { showAlert } from "@/components/ui/AppAlert";
import { trackEvent } from "@/utils/analytics";

// Split out of useSupportChat so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

/** Ticket list and open conversation re-fetch interval. */
const POLL_MS = 4000;

export function useSupportChatHandleCreateTicket(setViewMode: any, setAllTickets: any, ticket: any, setTicket: any, newCategory: any, newTitle: any, setNewTitle: any, newMessage: any, setNewMessage: any, setCreatingTicket: any, flatListRef: any, fetchTickets: any) {
  useEffect(() => {
    fetchTickets(true);
  }, []);
  const { refresh, refreshing } = usePolling(() => fetchTickets(false), POLL_MS, { immediate: false });

  useEffect(() => {
    if (ticket && ticket.messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
    }
  }, [ticket?.messages?.length]);

  const handleCreateTicket = async () => {
    if (!newTitle.trim() || !newMessage.trim()) {
      showAlert(i18n.t("app.delivery.missingDetails"), i18n.t("app.support.addATitleAndAShort"));
      return;
    }
    setCreatingTicket(true);
    try {
      const created = await createSupportTicket<SupportTicket>({ title: newTitle.trim(), category: newCategory, message: newMessage.trim() });
      trackEvent("support_opened", { action: "ticket_created", category: newCategory });
      setAllTickets((prev: any) => [created, ...prev]);
      setTicket(created);
      setNewTitle("");
      setNewMessage("");
      setViewMode("chat");
    } catch (error: any) {
      showAlert(i18n.t("app.ride.couldntSubmit"), error.message || i18n.t("app.ride.pleaseTryAgain"));
    } finally {
      setCreatingTicket(false);
    }
  };

  return { handleCreateTicket, refresh, refreshing };
}
