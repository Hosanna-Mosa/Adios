import { ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useSupportChat } from "@/features/support/hooks/useSupportChat";
import { SupportChatSidebar } from "@/features/support/components/SupportChatSidebar";
import { SupportChatWindow } from "@/features/support/components/SupportChatWindow";

export default function SupportChat() {
  const {
    navigateToIssues,
    navigateToChat,
    activeTickets,
    isLoading,
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
    <DashboardLayout searchPlaceholder="Search active chats...">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={navigateToIssues} className="p-2 hover:bg-muted rounded-xl transition-colors border border-border bg-card shadow-sm" title="Back to Support Cases">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div>
            <h1 className="page-header">Active Chats</h1>
            <p className="page-subtitle">Real-time chat portal for ongoing user issues and resolution.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[720px]">
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
