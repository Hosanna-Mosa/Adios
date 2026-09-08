import React, { useState, useRef, useEffect } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {  } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/colors";
import { useDriverStore } from "@/store/driverStore";
import { socketService } from "@/utils/socketService";
import {
  CreateTicketForm,
  ResolveRequestPrompt,
  ResolvedNotice,
  SupportChatHeader,
  SupportComposer,
  SupportMessageBubble,
  SupportScreenHeader,
  TicketListItem,
} from "@/features/support/components";
import type { SupportTicket } from "@/features/support/types";
import { styles } from "@/features/support/support-chat.styles";
import { API_URL as apiUrl } from "@/utils/apiUrl";

export default function SupportChatScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ ticketId?: string }>();
  const token = useDriverStore((s) => s.token);

  const [viewMode, setViewMode] = useState<"loading" | "list" | "chat" | "create">("loading");
  const [loading, setLoading] = useState(true);
  const [allTickets, setAllTickets] = useState<SupportTicket[]>([]);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [inputText, setInputText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // Form states for creating a ticket
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("OPERATIONAL ISSUE");
  const [newMessage, setNewMessage] = useState("");
  const [creatingTicket, setCreatingTicket] = useState(false);

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
  useEffect(() => {
    fetchTickets(true);

    socketService.connect();
    const handleTicketUpdate = (updatedTicket: any) => {
      console.log("[SOCKET] Partner support ticket updated:", updatedTicket);
      setTicket((prev) => (prev && prev._id === updatedTicket._id ? updatedTicket : prev));
      setAllTickets((prev) => prev.map((t) => (t._id === updatedTicket._id ? updatedTicket : t)));
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

  // Scroll to bottom when ticket messages update
  useEffect(() => {
    if (ticket && ticket.messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [ticket?.messages?.length]);

  const handleCreateTicket = async () => {
    if (!newTitle.trim() || !newMessage.trim()) {
      Alert.alert("Required fields", "Please fill in the summary and description");
      return;
    }

    setCreatingTicket(true);
    try {
      const created = await supportFetch("/support/tickets", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle.trim(),
          category: newCategory,
          message: newMessage.trim(),
        }),
      });
      setTicket(created);
      setAllTickets(prev => [created, ...prev]);
      setViewMode("chat");
      Alert.alert("Ticket Created", "Partner Support has received your case and will respond shortly.");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create support ticket");
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
      const updatedTicket = await supportFetch(`/support/tickets/${ticket._id}/messages`, {
        method: "POST",
        body: JSON.stringify({ text: messageText }),
      });
      setTicket(updatedTicket);
    } catch (error: any) {
      Alert.alert("Failed to send message", error.message || "Please try again.");
      setInputText(messageText); // restore text
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: Colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 12, color: Colors.textSecondary }}>Loading support session...</Text>
      </View>
    );
  }

  // If list screen view
  if (viewMode === "list") {
    return (
      <View style={[styles.root, { backgroundColor: Colors.background }]}>
        <SupportScreenHeader
          title="Support Sessions"
          paddingTop={insets.top + 16}
          onBack={() => router.back()}
        />

        <FlatList
          data={allTickets}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          renderItem={({ item }) => (
            <TicketListItem
              ticket={item}
              onPress={() => {
                setTicket(item);
                setViewMode("chat");
              }}
            />
          )}
          ListFooterComponent={() => (
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: Colors.primary, marginTop: 8, marginBottom: 24 },
              ]}
              onPress={() => {
                setNewTitle("");
                setNewMessage("");
                setViewMode("create");
              }}
            >
              <Text style={styles.submitBtnText}>+ Start New Support Chat</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  // If creation Form view
  if (viewMode === "create") {
    return (
      <View style={[styles.root, { backgroundColor: Colors.background }]}>
        <SupportScreenHeader
          title="Create Support Ticket"
          paddingTop={insets.top + 16}
          onBack={() => {
            if (allTickets.length > 0) {
              setViewMode("list");
            } else {
              router.back();
            }
          }}
        />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <FlatList
            data={[{ key: "form" }]}
            renderItem={() => (
              <CreateTicketForm
                category={newCategory}
                onCategoryChange={setNewCategory}
                title={newTitle}
                onTitleChange={setNewTitle}
                message={newMessage}
                onMessageChange={setNewMessage}
                submitting={creatingTicket}
                onSubmit={handleCreateTicket}
              />
            )}
            keyExtractor={(item) => item.key}
            contentContainerStyle={{ paddingVertical: 12 }}
          />
        </KeyboardAvoidingView>
      </View>
    );
  }

  // Active Chat UI
  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: Colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <SupportChatHeader
        ticket={ticket}
        paddingTop={insets.top + (Platform.OS === "web" ? 67 : 0) + 12}
        onBack={() => {
          if (allTickets.length > 0) {
            setViewMode("list");
          } else {
            router.back();
          }
        }}
      />

      {/* Message List */}
      {ticket && (
        <FlatList
          ref={flatListRef}
          data={ticket.messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => <SupportMessageBubble message={item} />}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      {/* Input Bar */}
      {ticket && ticket.status === "RESOLVED" ? (
        <ResolvedNotice
          paddingBottom={insets.bottom + 16}
          onReopen={async () => {
            try {
              setLoading(true);
              // Submitting a new message reopens the ticket
              await supportFetch(`/support/tickets/${ticket._id}/messages`, {
                method: "POST",
                body: JSON.stringify({ text: "Re-opening this case. I still need assistance." }),
              });
              await fetchTickets(true);
              setViewMode("chat");
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to reopen ticket");
            } finally {
              setLoading(false);
            }
          }}
          onStartNew={() => {
            setNewTitle("");
            setNewMessage("");
            setTicket(null);
            setViewMode("create");
          }}
        />
      ) : ticket && ticket.status === "PENDING_RESOLVE" ? (
        <ResolveRequestPrompt
          paddingBottom={insets.bottom + 16}
          onApprove={async () => {
            try {
              setLoading(true);
              const updated = await supportFetch(`/support/tickets/${ticket._id}/resolve`, {
                method: "POST",
                body: JSON.stringify({ approve: true }),
              });
              setTicket(updated);
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to resolve ticket");
            } finally {
              setLoading(false);
            }
          }}
          onDecline={async () => {
            try {
              setLoading(true);
              const updated = await supportFetch(`/support/tickets/${ticket._id}/resolve`, {
                method: "POST",
                body: JSON.stringify({ approve: false }),
              });
              setTicket(updated);
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to decline request");
            } finally {
              setLoading(false);
            }
          }}
        />
      ) : (
        <SupportComposer
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSendMessage}
          sending={submittingReply}
          paddingBottom={insets.bottom + 8}
        />
      )}
    </KeyboardAvoidingView>
  );
}
