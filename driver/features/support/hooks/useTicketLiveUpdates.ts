import { useEffect } from "react";
import { socketService } from "@/utils/socketService";
import type { SupportTicket } from "../types";

/** Keeps an open ticket live: the agent's replies arrive over the socket. */
export function useTicketLiveUpdates({
  ticket,
  setTicket,
  setAllTickets,
  fetchTickets,
  flatListRef,
}: {
  ticket: SupportTicket | null;
  setTicket: (updater: any) => void;
  setAllTickets: (updater: any) => void;
  fetchTickets: (showLoading?: boolean) => Promise<void> | void;
  flatListRef: React.RefObject<any>;
}) {
  useEffect(() => {
    fetchTickets(true);

    socketService.connect();
    const handleTicketUpdate = (updatedTicket: any) => {
      console.log("[SOCKET] Partner support ticket updated:", updatedTicket);
      setTicket((prev: any) => (prev && prev._id === updatedTicket._id ? updatedTicket : prev));
      setAllTickets((prev: any) => prev.map((t: any) => (t._id === updatedTicket._id ? updatedTicket : t)));
    };
    socketService.on("ticket_updated", handleTicketUpdate);

    const interval = setInterval(() => {
      fetchTickets(false);
    }, 4000);

    return () => {
      clearInterval(interval);
      socketService.off("ticket_updated", handleTicketUpdate);
    };
  }, []);
}
