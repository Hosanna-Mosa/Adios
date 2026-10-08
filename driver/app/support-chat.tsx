import { Platform, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {  } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { CreateTicketView, SupportLoading, TicketChatView, TicketListView } from "@/features/support/components";
import { useSupportChat } from "@/features/support/hooks/useSupportChat";

export default function SupportChatScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const {
    viewMode, setViewMode, loading, setLoading,
    allTickets, ticket, setTicket,
    inputText, setInputText, submittingReply,
    newTitle, setNewTitle, newCategory, setNewCategory,
    newMessage, setNewMessage, creatingTicket,
    flatListRef, supportFetch, fetchTickets,
    handleCreateTicket, handleSendMessage,
    refreshTickets, refreshingTickets,
  } = useSupportChat();

  if (loading) {
    return (
      <SupportLoading message={t("support.loadingSupportSession")} />
    );
  }

  // If list screen view
  if (viewMode === "list") {
    return (
      <TicketListView
        tickets={allTickets}
        paddingTop={insets.top + 16}
        onBack={() => router.back()}
        onRefresh={refreshTickets}
        refreshing={refreshingTickets}
        onOpenTicket={(t) => {
          setTicket(t);
          setViewMode("chat");
        }}
        onStartNew={() => {
          setNewTitle("");
          setNewMessage("");
          setViewMode("create");
        }}
      />
    );
  }

  // If creation Form view
  if (viewMode === "create") {
    return (
      <CreateTicketView
        paddingTop={insets.top + 16}
        onBack={() => (allTickets.length > 0 ? setViewMode("list") : router.back())}
        category={newCategory}
        onCategoryChange={setNewCategory}
        title={newTitle}
        onTitleChange={setNewTitle}
        message={newMessage}
        onMessageChange={setNewMessage}
        submitting={creatingTicket}
        onSubmit={handleCreateTicket}
      />
    );
  }

  return (
    <TicketChatView
      ticket={ticket}
      flatListRef={flatListRef}
      topInset={insets.top + (Platform.OS === "web" ? 67 : 0) + 12}
      bottomInset={insets.bottom}
      inputText={inputText}
      setInputText={setInputText}
      submittingReply={submittingReply}
      onBack={() => (allTickets.length > 0 ? setViewMode("list") : router.back())}
      onSend={handleSendMessage}
      onRefresh={refreshTickets}
      refreshing={refreshingTickets}
      onReopen={async () => {
        try {
          setLoading(true);
          // Submitting a new message reopens the ticket
          await supportFetch(`/support/tickets/${ticket!._id}/messages`, {
            method: "POST",
            body: JSON.stringify({ text: t("support.reOpeningThisCase") }),
          });
          await fetchTickets(true);
          setViewMode("chat");
        } catch (err: any) {
          Alert.alert(t("auth.errorTitle"), err.message || t("support.failedToReopenTicket"));
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
      onResolve={async (approve) => {
        try {
          setLoading(true);
          const updated = await supportFetch(`/support/tickets/${ticket!._id}/resolve`, {
            method: "POST",
            body: JSON.stringify({ approve }),
          });
          setTicket(updated);
        } catch (err: any) {
          Alert.alert(t("auth.errorTitle"), err.message || t("support.failedToUpdateTicket"));
        } finally {
          setLoading(false);
        }
      }}
    />
  );
}