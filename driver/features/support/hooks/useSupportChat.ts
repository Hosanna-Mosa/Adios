import { useEffect, useRef, useState } from "react";
import { FlatList } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useDriverStore } from "@/store/driverStore";
import { API_URL as apiUrl } from "@/utils/apiUrl";
import type { SupportTicket } from "../types";
import { useTicketActions } from "./useTicketActions";
import { useTicketLiveUpdates } from "./useTicketLiveUpdates";

/** Support tickets: listing them, opening one, creating a new one, and
 * sending replies. Also keeps an open ticket live over the socket.
 *
 * Lifted out of app/support-chat.tsx unchanged. */
export function useSupportChat() {
  const params = useLocalSearchParams();
  const token = useDriverStore((s) => s.token);
  const [viewMode, setViewMode] = useState<"loading" | "list" | "chat" | "create">("loading");
  const [loading, setLoading] = useState(true);
  const [allTickets, setAllTickets] = useState<SupportTicket[]>([]);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [inputText, setInputText] = useState("");

  // Form states for creating a ticket
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("OPERATIONAL ISSUE");
  const [newMessage, setNewMessage] = useState("");

  const flatListRef = useRef<FlatList>(null);
  const ticketRef = useRef<SupportTicket | null>(null);

  useEffect(() => {
    ticketRef.current = ticket;
  }, [ticket]);

  const supportFetch = async (endpoint: string, options: RequestInit = {}) => {
    if (!token || !apiUrl) throw new Error("Authentication or API configuration is missing");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    };
    const response = await fetch(`${apiUrl}${endpoint}`, {
      ...options,
      headers,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `HTTP ${response.status}`);
    }
    return response.json();
  };

  // Fetch current ticket(s)
  const fetchTickets = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const tickets: SupportTicket[] = await supportFetch("/support/tickets");
      setAllTickets(tickets || []);

      // Opened via a deep link (notification tap) with a specific ticket in mind — jump
      // straight into that conversation regardless of the single/multiple-ticket defaults below.
      if (showLoading && params.ticketId) {
        const target = tickets.find((t) => t._id === params.ticketId);
        if (target) {
          setTicket(target);
          setViewMode("chat");
          return;
        }
      }

      if (tickets && tickets.length > 0) {
        if (showLoading) {
          if (tickets.length === 1) {
            const latest = tickets[0];
            setTicket(latest);
            if (latest.status === "RESOLVED") {
              setViewMode("list");
            } else {
              setViewMode("chat");
            }
          } else {
            setViewMode("list");
          }
        } else {
          // Background poll: update active ticket details if we are currently viewing it
          const currentActive = ticketRef.current;
          if (currentActive) {
            const activeT = tickets.find((t: SupportTicket) => t._id === currentActive._id);
            if (activeT) setTicket(activeT);
          }
        }
      } else {
        if (showLoading) {
          setTicket(null);
          setViewMode("create");
        }
      }
    } catch (error) {
      console.error("Failed to fetch support tickets:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Poll for new messages/updates + listen to live socket events

  // Scroll to bottom when ticket messages update
  useEffect(() => {
    if (ticket && ticket.messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [ticket?.messages?.length]);

  useTicketLiveUpdates({ ticket, setTicket, setAllTickets, fetchTickets, flatListRef });

  const { creatingTicket, submittingReply, handleCreateTicket, handleSendMessage } =
    useTicketActions({
      supportFetch, fetchTickets, setTicket, setViewMode,
      newTitle, setNewTitle, newCategory, newMessage, setNewMessage,
      inputText, setInputText, ticket, setAllTickets,
    });

  return {
    viewMode, setViewMode, loading, setLoading,
    allTickets, ticket, setTicket,
    inputText, setInputText, submittingReply,
    newTitle, setNewTitle, newCategory, setNewCategory,
    newMessage, setNewMessage, creatingTicket,
    flatListRef, supportFetch, fetchTickets,
    handleCreateTicket, handleSendMessage,
  };
}
