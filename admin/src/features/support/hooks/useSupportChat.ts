import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import { TICKETS_REFRESH_MS } from "./ticketsPolling";
import type { Ticket } from "../types";

/**
 * All state/query logic for SupportChat.tsx (work queue item #14).
 * Reads (and polls) the same /admin/tickets data as
 * useSupportTickets (item #10) and useSupportIssues (item #12), but this
 * page additionally auto-redirects to the first active ticket when no
 * :id route param is given, and auto-scrolls the message pane -- distinct
 * enough behavior that it's its own hook rather than a shared one.
 */
export function useSupportChat() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [typedMessage, setTypedMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all support tickets
  const { data: ticketsList = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin", "tickets"],
    queryFn: () => adminFetch<Ticket[]>("/admin/tickets"),
    refetchInterval: TICKETS_REFRESH_MS,
    refetchIntervalInBackground: false,
  });

  // Filter for ACTIVE (OPEN or PENDING_RESOLVE) tickets to display in the sidebar
  const activeTickets = ticketsList.filter((t) => t.status === "OPEN" || t.status === "PENDING_RESOLVE");

  // Determine the selected ticket. If deep-linked, look for matches in ticketsList.
  // Otherwise, default to first active ticket in the list.
  const selectedTicket = id ? ticketsList.find((t) => t._id === id) : activeTickets[0];

  // Auto-redirect if no ID is specified in the route but we have active tickets
  useEffect(() => {
    if (!id && activeTickets.length > 0) {
      navigate(`/support/chats/${activeTickets[0]._id}`, { replace: true });
    }
  }, [id, activeTickets, navigate]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.messages]);

  // Mutation to update ticket (send reply or update status)
  const updateTicketMutation = useMutation({
    mutationFn: ({ ticketId, payload }: { ticketId: string; payload: Record<string, unknown> }) =>
      adminFetch<Ticket>(`/admin/tickets/${ticketId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
      // If the ticket was resolved, it might be filtered out from active. Notify and potentially navigate away.
      if (data.status === "RESOLVED") {
        toast.success(t("support.ticketMarkedAsResolved", { ticketId: data.ticketId, defaultValue: "Ticket {{ticketId}} marked as Resolved!" }));
      } else if (data.status === "PENDING_RESOLVE") {
        toast.success(t("support.resolutionRequestSentForTicket", { ticketId: data.ticketId, defaultValue: "Resolution request sent for ticket {{ticketId}}" }));
      } else {
        toast.success(t("support.ticketUpdatedSuccessfully"));
      }
    },
  });

  const handleSendMessage = () => {
    if (!typedMessage.trim() || !selectedTicket) return;
    updateTicketMutation.mutate({
      ticketId: selectedTicket._id,
      payload: {
        replyText: typedMessage,
        sender: "admin",
      },
    });
    setTypedMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResolve = () => {
    if (!selectedTicket) return;
    updateTicketMutation.mutate({ ticketId: selectedTicket._id, payload: { status: "RESOLVED" } });
  };

  const handleReopen = () => {
    if (!selectedTicket) return;
    updateTicketMutation.mutate({ ticketId: selectedTicket._id, payload: { status: "OPEN" } });
  };

  return {
    navigateToIssues: () => navigate("/support-cases"),
    navigateToChat: (ticketId: string) => navigate(`/support/chats/${ticketId}`),
    activeTickets,
    isLoading,
    isFetching,
    refetch,
    selectedTicket,
    messagesEndRef,
    typedMessage,
    setTypedMessage,
    handleSendMessage,
    handleKeyPress,
    handleResolve,
    handleReopen,
  };
}
