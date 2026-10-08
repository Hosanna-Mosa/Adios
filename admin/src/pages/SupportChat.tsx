import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { useSupportChat } from "@/features/support/hooks/useSupportChat";
import { SupportChatSidebar } from "@/features/support/components/SupportChatSidebar";
import { SupportChatWindow } from "@/features/support/components/SupportChatWindow";

export default function SupportChat() {
  const { t } = useTranslation();
  const {
    navigateToIssues,
    navigateToChat,
    activeTickets,
    isLoading,
    isFetching,
    refetch,
    selectedTicket,
    messagesEndRef,
    typedMessage,
    setTypedMessage,
    handleSendMessage,
    handleKeyPress,
    handleResolve,
    handleReopen,
  } = useSupportChat();

  return (
    <DashboardLayout searchPlaceholder={t("support.searchActiveChats")}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={navigateToIssues} className="p-2 hover:bg-muted rounded-xl transition-colors border border-border bg-card shadow-sm" title={t("support.backToSupportCases")}>
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="page-header">{t("support.activeChats")}</h1>
            <p className="page-subtitle">{t("support.realTimeChatPortalDesc")}</p>
          </div>
          <RefreshButton onRefresh={() => refetch()} isRefreshing={isFetching} label={t("common.refresh")} />
        </div>

        {/* Fills what's left of the window below the top bar, page padding and title
            (~14rem), so the composer and Send button are always on screen. */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-14rem)] min-h-[480px]">
          <SupportChatSidebar tickets={activeTickets} isLoading={isLoading} selectedTicketId={selectedTicket?._id} onSelect={navigateToChat} />

          <SupportChatWindow
            ticket={selectedTicket}
            messagesEndRef={messagesEndRef}
            typedMessage={typedMessage}
            onTypedMessageChange={setTypedMessage}
            onKeyDown={handleKeyPress}
            onSend={handleSendMessage}
            onResolve={handleResolve}
            onReopen={handleReopen}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
