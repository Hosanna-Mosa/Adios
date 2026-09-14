import { useMemo } from "react";
import { SupportTicketList } from "@/features/support/components/SupportTicketList";
import { FlatList } from "react-native";
import { useTranslation } from "react-i18next";
import { SupportMessageBubble } from "@/features/support/components/SupportMessageBubble";
import { SupportChatHeader } from "@/features/support/components/SupportChatHeader";
import { SupportChatHeader2 } from "@/features/support/components/SupportChatHeader2";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { ResolveTicketPrompt } from "@/features/support/components/ResolveTicketPrompt";
import { SupportChatBody } from "@/features/support/components/SupportChatBody";
import { SupportChatLoading } from "@/features/support/components/SupportChatLoading";
import { getSupportCategories } from "@/features/support/useSupportChat";
import { useSupportChat } from "@/features/support/useSupportChat";

export default function SupportChatScreen() {
  const {
  insets, tokens, accent, styles, viewMode, setViewMode, loading, allTickets, ticket, setTicket,
  inputText, setInputText, submittingReply, newCategory, setNewCategory, newTitle, setNewTitle,
  newMessage, setNewMessage, creatingTicket, flatListRef, handleCreateTicket, handleSendMessage,
  handleResolve, handleReopen
  } = useSupportChat();
  const { t } = useTranslation();

  const STATUS_LABEL: Record<string, string> = useMemo(() => ({
    OPEN: t("app.supportChat.statusLabel.open"),
    RESOLVED: t("app.supportChat.statusLabel.resolved"),
    PENDING_RESOLVE: t("app.supportChat.statusLabel.pendingResolve"),
  }), [t]);
  const CATEGORIES = useMemo(() => getSupportCategories(), [t]);

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

// STATUS_LABEL moved inside SupportChatScreen() as a useMemo value — see
// ADIOS_MULTILINGUAL_DEVELOPMENT_PLAN.md, Section 11.

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], { day: "numeric", month: "short" });
}
