import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { createStyles } from "./support-chat.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { customFetch } from "@/utils/api/custom-fetch";
import { getSupportCategories, SupportTicket } from "./useSupportChat.shared";

// Part 1 of useSupportChat, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useSupportChatInsets() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ ticketId?: string }>();
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = { accent: tokens.brand, skin: tokens.brandSkin, on: tokens.onBrand };
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);

  const [viewMode, setViewMode] = useState<"cases" | "chat">("cases");
  const [loading, setLoading] = useState(true);
  const [allTickets, setAllTickets] = useState<SupportTicket[]>([]);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [inputText, setInputText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const [newCategory, setNewCategory] = useState(getSupportCategories()[0].value);
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [creatingTicket, setCreatingTicket] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const ticketRef = useRef<SupportTicket | null>(null);
  useEffect(() => { ticketRef.current = ticket; }, [ticket]);

  const fetchTickets = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const tickets = await customFetch<SupportTicket[]>("/support/tickets");
      setAllTickets(tickets || []);

      // Opened via a deep link (notification tap) with a specific ticket in mind — jump
      // straight into that conversation instead of the cases list.
      if (params.ticketId) {
        const target = (tickets || []).find((t) => t._id === params.ticketId);
        if (target) {
          setTicket(target);
          setViewMode("chat");
          return;
        }
      }

      const currentActive = ticketRef.current;
      if (currentActive) {
        const activeT = (tickets || []).find((t) => t._id === currentActive._id);
        if (activeT) setTicket(activeT);
      }
    } catch (error) {
      console.error("Failed to fetch support tickets:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  return { insets, tokens, accent, styles, viewMode, setViewMode, loading, allTickets, setAllTickets, ticket, setTicket, inputText, setInputText, submittingReply, setSubmittingReply, newCategory, setNewCategory, newTitle, setNewTitle, newMessage, setNewMessage, creatingTicket, setCreatingTicket, flatListRef, fetchTickets };
}
