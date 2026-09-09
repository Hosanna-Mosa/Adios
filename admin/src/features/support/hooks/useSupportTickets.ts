import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminFetch } from "@/lib/api-client";
import { socketService } from "@/lib/socketService";
import type { NewTicketForm, Ticket } from "../types";

const EMPTY_NEW_TICKET: NewTicketForm = { title: "", category: "OPERATIONAL ISSUE", message: "", user: "Platform User" };

/** All state/query/socket logic for Support.tsx (work queue item #10). */
export function useSupportTickets() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "RESOLVED">("ACTIVE");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTicket, setNewTicket] = useState<NewTicketForm>(EMPTY_NEW_TICKET);

  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [typedMessage, setTypedMessage] = useState("");

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
      setActiveTicketId(data._id);
      setIsCreateOpen(false);
      setNewTicket(EMPTY_NEW_TICKET);
      toast.success(`Ticket ${data.ticketId} created successfully!`);
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      adminFetch<Ticket>(`/admin/tickets/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
      toast.success("Ticket updated successfully!");
    },
  });

  const filteredTickets = ticketsList.filter((t) => (activeTab === "ACTIVE" ? t.status === "OPEN" : t.status === "RESOLVED"));

  const selectedTicket = ticketsList.find((t) => t._id === activeTicketId) || filteredTickets[0] || ticketsList[0];

  // Auto-set the active ticket ID once loaded. Kept as a direct render-phase
  // state update (not wrapped in useEffect) exactly as the original had it --
  // React applies this before the initial paint, so wrapping it in an effect
  // would change the timing (an extra post-paint render) rather than just
  // relocating the code.
  if (!activeTicketId && selectedTicket) {
    setActiveTicketId(selectedTicket._id);
  }

  // Connect to Socket.io and listen for support updates
  useEffect(() => {
    socketService.connect();

    const adminData = JSON.parse(localStorage.getItem("admin_data") || "{}");
    if (adminData._id) {
      socketService.join(adminData._id, "ADMIN");
    }

    const handleTicketUpdate = (data: unknown) => {
      console.log("[SOCKET] Ticket update received:", data);
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
    };

    socketService.on("ticket_updated", handleTicketUpdate);

    return () => {
      socketService.off("ticket_updated", handleTicketUpdate);
    };
  }, [queryClient]);

  const handleSendMessage = () => {
    if (!typedMessage.trim() || !selectedTicket) return;
    updateTicketMutation.mutate({
      id: selectedTicket._id,
      payload: {
        replyText: typedMessage,
        sender: "admin",
      },
    });
    setTypedMessage("");
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.title || !newTicket.message) {
      toast.error("Please enter a title and message.");
      return;
    }
    createTicketMutation.mutate(newTicket);
  };

  const handleResolve = () => {
    if (!selectedTicket) return;
    updateTicketMutation.mutate({ id: selectedTicket._id, payload: { status: "RESOLVED" } });
  };

  const handleReopen = () => {
    if (!selectedTicket) return;
    updateTicketMutation.mutate({ id: selectedTicket._id, payload: { status: "OPEN" } });
  };

  return {
    activeTab,
    setActiveTab,
    ticketsList,
    filteredTickets,
    isLoading,
    selectedTicket,
    setActiveTicketId,
    isCreateOpen,
    setIsCreateOpen,
    newTicket,
    setNewTicket,
    typedMessage,
    setTypedMessage,
    handleSendMessage,
    handleCreateTicketSubmit,
    handleResolve,
    handleReopen,
  };
}
