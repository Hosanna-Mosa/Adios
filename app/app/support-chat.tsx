import { router } from "expo-router";
import { SupportTicketList } from "@/features/support/components/SupportTicketList";
import { FlatList } from "react-native";
import { SupportMessageBubble } from "@/features/support/components/SupportMessageBubble";
import { SupportChatHeader } from "@/features/support/components/SupportChatHeader";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { ResolveTicketPrompt } from "@/features/support/components/ResolveTicketPrompt";
import { SupportChatBody } from "@/features/support/components/SupportChatBody";
import { SupportChatLoading } from "@/features/support/components/SupportChatLoading";
import { CATEGORIES, useSupportChat } from "@/features/support/useSupportChat";

export default function SupportChatScreen() {
  const {
  insets, tokens, accent, styles, viewMode, setViewMode, loading, allTickets, ticket, setTicket,
  inputText, setInputText, submittingReply, newCategory, setNewCategory, newTitle, setNewTitle,
  newMessage, setNewMessage, creatingTicket, flatListRef, handleCreateTicket, handleSendMessage,
  handleResolve, handleReopen
  } = useSupportChat();

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
          title="Flavour Support"
          subtitle={`Case #${ticket.ticketId} · ${STATUS_LABEL[ticket.status]}`}
          onBack={() => setViewMode("cases")}
          insets={insets}
          styles={styles}
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
      <SupportChatHeader
        title="Your cases"
        onBack={() => router.back()}
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

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Open",
  RESOLVED: "Resolved",
  PENDING_RESOLVE: "Awaiting your reply",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], { day: "numeric", month: "short" });
}
