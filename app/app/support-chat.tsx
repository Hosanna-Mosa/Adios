import React, { useEffect, useMemo, useRef, useState } from "react";
import { SupportTicketList } from "@/features/support/components/SupportTicketList";
import { Alert, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLocalSearchParams } from "expo-router";

import { createStyles } from "@/features/support/support-chat.styles";
import { SupportMessageBubble } from "@/features/support/components/SupportMessageBubble";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { customFetch } from "@/utils/api/custom-fetch";
import { socketService } from "@/utils/socketService";
import { SupportChatHeader } from "@/features/support/components/SupportChatHeader";
import { SupportChatHeader2 } from "@/features/support/components/SupportChatHeader2";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { ResolveTicketPrompt } from "@/features/support/components/ResolveTicketPrompt";
import { SupportChatBody } from "@/features/support/components/SupportChatBody";
import { SupportChatLoading } from "@/features/support/components/SupportChatLoading";

interface ChatMessage {
  sender: "user" | "admin" | "system";
  time: string;
  text: string;
}

interface SupportTicket {
  _id: string;
  ticketId: string;
  title: string;
  category: string;
  status: "OPEN" | "RESOLVED" | "PENDING_RESOLVE";
  message: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// The `category` field is free text on the backend — these four are simply
// the ones already seeded/expected by the admin dashboard's own icon
// matching (admin/src/pages/Support.tsx keys off "BILLING", "QUALITY", etc.
// in the category string), so they're kept exactly as-is rather than
// adopting the mockup's own wording, which would silently break that
// matching for every ticket raised from this screen.
const CATEGORIES = [
  { label: "Operational issue", value: "OPERATIONAL ISSUE" },
  { label: "Delayed delivery", value: "DELAYED DELIVERY" },
  { label: "Quality control", value: "QUALITY CONTROL" },
  { label: "Billing adjustment", value: "BILLING ADJUSTMENT" },
];

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Open",
  RESOLVED: "Resolved",
  PENDING_RESOLVE: "Awaiting your reply",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], { day: "numeric", month: "short" });
}

export default function SupportChatScreen() {
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

  const [newCategory, setNewCategory] = useState(CATEGORIES[0].value);
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

  useEffect(() => {
    fetchTickets(true);
    socketService.connect();
    const handleTicketUpdate = (updatedTicket: any) => {
      setTicket((prev) => (prev && prev._id === updatedTicket._id ? updatedTicket : prev));
      setAllTickets((prev) => prev.map((t) => (t._id === updatedTicket._id ? updatedTicket : t)));
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
      Alert.alert("Missing details", "Add a title and a short description first.");
      return;
    }
    setCreatingTicket(true);
    try {
      const created = await customFetch<SupportTicket>("/support/tickets", {
        method: "POST",
        body: JSON.stringify({ title: newTitle.trim(), category: newCategory, message: newMessage.trim() }),
      });
      setAllTickets((prev) => [created, ...prev]);
      setTicket(created);
      setNewTitle("");
      setNewMessage("");
      setViewMode("chat");
    } catch (error: any) {
      Alert.alert("Couldn't submit", error.message || "Please try again.");
    } finally {
      setCreatingTicket(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !ticket) return;
    const messageText = inputText.trim();
    setInputText("");
    setSubmittingReply(true);
    try {
      const updatedTicket = await customFetch<SupportTicket>(`/support/tickets/${ticket._id}/messages`, {
        method: "POST",
        body: JSON.stringify({ text: messageText }),
      });
      setTicket(updatedTicket);
    } catch (error: any) {
      Alert.alert("Message not sent", error.message || "Please try again.");
      setInputText(messageText);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleResolve = async (approve: boolean) => {
    if (!ticket) return;
    try {
      const updated = await customFetch<SupportTicket>(`/support/tickets/${ticket._id}/resolve`, {
        method: "POST",
        body: JSON.stringify({ approve }),
      });
      setTicket(updated);
      setAllTickets((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    } catch (err: any) {
      Alert.alert("Error", err.message || "Please try again.");
    }
  };

  const handleReopen = async (t: SupportTicket) => {
    try {
      await customFetch(`/support/tickets/${t._id}/messages`, {
        method: "POST",
        body: JSON.stringify({ text: "Re-opening this case — I still need help with it." }),
      });
      await fetchTickets(true);
      setTicket(t);
      setViewMode("chat");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to reopen case");
    }
  };

  if (loading) {
    return (
      <SupportChatLoading
        accent={accent}
        insets={insets}
        styles={styles}
      />
    );
  }

  // -----------------------------------------------------------------------
  // Chat view (32b)
  // -----------------------------------------------------------------------
  if (viewMode === "chat" && ticket) {
    const isResolved = ticket.status === "RESOLVED";
    return (
      <ScreenShell keyboardAvoiding>
        <SupportChatHeader
          STATUS_LABEL={STATUS_LABEL}
          insets={insets}
          setViewMode={setViewMode}
          styles={styles}
          ticket={ticket}
          tokens={tokens}
        />

        <FlatList
          ref={flatListRef}
          style={styles.messagesFlatList}
          data={ticket.messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <SupportMessageBubble item={item} styles={styles} accent={accent} tokens={tokens} />
          )}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

                  <SupportChatBody
          isResolved={isResolved}
            accent={accent}
            handleReopen={handleReopen}
            handleSendMessage={handleSendMessage}
            inputText={inputText}
            insets={insets}
            setInputText={setInputText}
            setNewMessage={setNewMessage}
            setNewTitle={setNewTitle}
            setViewMode={setViewMode}
            styles={styles}
            submittingReply={submittingReply}
            ticket={ticket}
            tokens={tokens}
          />

        <ResolveTicketPrompt
          accent={accent}
          handleResolve={handleResolve}
          styles={styles}
          ticket={ticket}
        />
      </ScreenShell>
    );
  }

  // -----------------------------------------------------------------------
  // Cases + new ticket view (32)
  // -----------------------------------------------------------------------
  return (
    <ScreenShell keyboardAvoiding>
      <SupportChatHeader2
        insets={insets}
        styles={styles}
        tokens={tokens}
      />

      <SupportTicketList
        CATEGORIES={CATEGORIES}
        STATUS_LABEL={STATUS_LABEL}
        formatDate={formatDate}
        accent={accent}
        allTickets={allTickets}
        creatingTicket={creatingTicket}
        handleCreateTicket={handleCreateTicket}
        handleReopen={handleReopen}
        insets={insets}
        newCategory={newCategory}
        newMessage={newMessage}
        newTitle={newTitle}
        setNewCategory={setNewCategory}
        setNewMessage={setNewMessage}
        setNewTitle={setNewTitle}
        setTicket={setTicket}
        setViewMode={setViewMode}
        styles={styles}
        ticket={ticket}
        tokens={tokens}
      />
    </ScreenShell>
  );
}
