import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import { TICKETS_REFRESH_MS } from "./ticketsPolling";
import type { NewTicketForm, Ticket } from "../types";

const EMPTY_NEW_TICKET: NewTicketForm = { title: "", category: "OPERATIONAL ISSUE", message: "", user: "Platform User" };

/**
 * All state/query logic for SupportIssues.tsx (work queue item
 * #12). Reads (and polls) the same /admin/tickets data as
 * useSupportTickets (item #10), but this page is a picker/
 * dashboard that navigates to a separate chat route on ticket creation or
 * click, rather than Support.tsx's in-place master-detail chat -- so it's
 * its own hook, not a shared one.
 */
export function useSupportIssues() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "RESOLVED">("ACTIVE");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTicket, setNewTicket] = useState<NewTicketForm>(EMPTY_NEW_TICKET);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const { data: ticketsList = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin", "tickets"],
    queryFn: () => adminFetch<Ticket[]>("/admin/tickets"),
    refetchInterval: TICKETS_REFRESH_MS,
    refetchIntervalInBackground: false,
  });

  const createTicketMutation = useMutation({
    mutationFn: (payload: NewTicketForm) =>
      adminFetch<Ticket>("/admin/tickets", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
      setIsCreateOpen(false);
      setNewTicket(EMPTY_NEW_TICKET);
      toast.success(t("support.ticketCreatedSuccessfully", { ticketId: data.ticketId, defaultValue: "Ticket {{ticketId}} created successfully!" }));
      // Navigate to chat for the newly created ticket
      navigate(`/support/chats/${data._id}`);
    },
  });

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.title || !newTicket.message) {
      toast.error(t("support.pleaseEnterTitleAndMessage"));
      return;
    }
    createTicketMutation.mutate(newTicket);
  };

  const filteredTickets = ticketsList.filter((ticket) => {
    // 1. Filter by Active vs Resolved Tab
    const matchesTab = activeTab === "ACTIVE" ? ticket.status === "OPEN" || ticket.status === "PENDING_RESOLVE" : ticket.status === "RESOLVED";

    // 2. Filter by Category
    const matchesCategory = categoryFilter === "ALL" || ticket.category === categoryFilter;

    // 3. Filter by Search (Title, ID, or Username)
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) || ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) || ticket.user.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesCategory && matchesSearch;
  });

  return {
    activeTab,
    setActiveTab,
    ticketsList,
    filteredTickets,
    isLoading,
    isFetching,
    refetch,
    isCreateOpen,
    setIsCreateOpen,
    newTicket,
    setNewTicket,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    handleCreateTicketSubmit,
    navigateToChat: (ticketId: string) => navigate(`/support/chats/${ticketId}`),
  };
}
