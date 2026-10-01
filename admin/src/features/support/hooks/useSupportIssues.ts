import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import { socketService } from "@/lib/socketService";
import type { NewTicketForm, Ticket } from "../types";

const EMPTY_NEW_TICKET: NewTicketForm = { title: "", category: "OPERATIONAL ISSUE", message: "", user: "Platform User" };

/**
 * All state/query/socket logic for SupportIssues.tsx (work queue item
 * #12). Reads the same /admin/tickets data and "ticket_updated" socket
 * event as useSupportTickets (item #10), but this page is a picker/
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

  const { data: ticketsList = [], isLoading } = useQuery({
    queryKey: ["admin", "tickets"],
    queryFn: () => adminFetch<Ticket[]>("/admin/tickets"),
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

  // Listen for socket updates in real-time
  useEffect(() => {
    socketService.connect();

    // This only ever read admin_data, but a support sign-in stores support_data —
    // so for the very role this page exists for, join() never ran and no live
    // ticket update ever arrived. Read whichever identity is actually present,
    // and join under that role. The parse is guarded because a malformed value in
    // localStorage would otherwise throw during render and blank the page.
    const readIdentity = (key: string): { _id?: string } => {
      try {
        return JSON.parse(localStorage.getItem(key) || "{}");
      } catch {
        return {};
      }
    };

    const adminData = readIdentity("admin_data");
    const supportData = readIdentity("support_data");

    if (adminData?._id) {
      socketService.join(adminData._id, "ADMIN");
    } else if (supportData?._id) {
      socketService.join(supportData._id, "SUPPORT");
    }

    const handleTicketUpdate = (data: unknown) => {
      console.log("[SOCKET] Ticket update received in Issues Selection:", data);
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
    };

    socketService.on("ticket_updated", handleTicketUpdate);

    return () => {
      socketService.off("ticket_updated", handleTicketUpdate);
    };
  }, [queryClient]);

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
