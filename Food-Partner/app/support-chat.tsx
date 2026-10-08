import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/ui/Header";
import { IconButton } from "@/components/ui/IconButton";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { ResolveTicketPrompt } from "@/features/support/components/ResolveTicketPrompt";
import { SupportCaseList } from "@/features/support/components/SupportCaseList";
import { SupportChatComposer } from "@/features/support/components/SupportChatComposer";
import { SupportLoading } from "@/features/support/components/SupportLoading";
import { SupportMessages } from "@/features/support/components/SupportMessages";
import { SupportNewTicketForm } from "@/features/support/components/SupportNewTicketForm";
import { useSupportChat } from "@/features/support/useSupportChat";
import { useSupportUnreadReplies } from "@/features/support/useSupportUnreadReplies";

/** /support-chat lists cases and raises new ones; /support-chat?ticketId=… opens one conversation. */
export default function SupportChatScreen() {
  const { t } = useTranslation();
  const s = useSupportChat();
  const { unreadCount } = useSupportUnreadReplies(s.allTickets, s.ticket, s.viewMode === "chat");
  const headerStyle = [s.styles.header, { paddingTop: s.insets.top + 12 }];
  const refreshButton = <IconButton icon="refresh" accessibilityLabel={t("actions.refresh")} onPress={s.refresh} loading={s.refreshing} />;

  if (s.loading) {
    return (
      <ScreenShell header={<Header bar title={t("support.yourCases")} onBack={() => router.back()} style={headerStyle} />}>
        <SupportLoading styles={s.styles} tokens={s.tokens} />
      </ScreenShell>
    );
  }

  if (s.viewMode === "chat" && s.ticket) {
    const status = t(
      { OPEN: "support.status.open", RESOLVED: "support.status.resolved", PENDING_RESOLVE: "support.status.pendingResolve" }[s.ticket.status],
    );
    return (
      <ScreenShell
        keyboardAvoiding
        header={<Header bar title={t("support.partnerSupport")} subtitle={`${t("support.case")} #${s.ticket.ticketId} · ${status}`} onBack={s.backToCases} style={headerStyle} right={refreshButton} />}
      >
        <SupportMessages messages={s.ticket.messages} listRef={s.flatListRef} styles={s.styles} accent={s.accent} tokens={s.tokens} />
        <SupportChatComposer
          ticket={s.ticket}
          inputText={s.inputText}
          setInputText={s.setInputText}
          submittingReply={s.submittingReply}
          onSend={s.handleSendMessage}
          onReopen={s.handleReopen}
          onStartNew={s.startNewChat}
          bottomInset={s.insets.bottom}
          styles={s.styles}
          tokens={s.tokens}
        />
        <ResolveTicketPrompt ticket={s.ticket} onResolve={s.handleResolve} styles={s.styles} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      keyboardAvoiding
      header={<Header bar title={t("support.yourCases")} onBack={() => router.back()} style={headerStyle} right={refreshButton} />}
      scroll
      contentStyle={{ paddingBottom: s.insets.bottom + 24 }}
    >
      <SupportCaseList
        tickets={s.allTickets}
        onOpen={s.openTicket}
        onReopen={s.handleReopen}
        onStartNew={s.startNewChat}
        unreadCount={unreadCount}
        styles={s.styles}
        tokens={s.tokens}
      />
      <SupportNewTicketForm
        categories={s.categories}
        newCategory={s.newCategory}
        setNewCategory={s.setNewCategory}
        newTitle={s.newTitle}
        setNewTitle={s.setNewTitle}
        newMessage={s.newMessage}
        setNewMessage={s.setNewMessage}
        creatingTicket={s.creatingTicket}
        onSubmit={s.handleCreateTicket}
        styles={s.styles}
      />
    </ScreenShell>
  );
}
