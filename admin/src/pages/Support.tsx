import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useSupportTickets } from "@/features/support/hooks/useSupportTickets";
import { TicketStatusTabs } from "@/features/support/components/TicketStatusTabs";
import { TicketList } from "@/features/support/components/TicketList";
import { SupportChatPanel } from "@/features/support/components/SupportChatPanel";
import { CreateTicketDialog } from "@/features/support/components/CreateTicketDialog";

export default function Support() {
  const { t } = useTranslation();
  const {
    activeTab,
    setActiveTab,
    ticketsList,
    filteredTickets,
    isLoading,
    selectedTicket,
    setActiveTicketId,
    isCreateOpen,
    setIsCreateOpen,
    newTicket,
    setNewTicket,
    typedMessage,
    setTypedMessage,
    handleSendMessage,
    handleCreateTicketSubmit,
    handleResolve,
    handleReopen,
  } = useSupportTickets();

  return (
    <DashboardLayout searchPlaceholder={t("support.searchLogisticsCases")}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-header">{t("support.supportResolution")}</h1>
            <p className="page-subtitle">{t("support.manageCustomerQueriesDesc")}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => toast.success(t("support.systemAuditLogsExported"))}
              className="px-5 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
            >
              {t("support.exportLogs")}
            </button>
            <button onClick={() => setIsCreateOpen(true)} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
              {t("support.createTicket")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 min-h-[700px]">
          <div className="section-card flex flex-col">
            <TicketStatusTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              openCount={ticketsList.filter((t) => t.status === "OPEN").length}
              resolvedCount={ticketsList.filter((t) => t.status === "RESOLVED").length}
            />
            <TicketList tickets={filteredTickets} isLoading={isLoading} selectedTicketId={selectedTicket?._id} onSelect={setActiveTicketId} />
          </div>

          <div className="section-card flex flex-col">
            <SupportChatPanel ticket={selectedTicket} typedMessage={typedMessage} onTypedMessageChange={setTypedMessage} onSend={handleSendMessage} onResolve={handleResolve} onReopen={handleReopen} />
          </div>
        </div>
      </div>

      <CreateTicketDialog isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} newTicket={newTicket} onChange={setNewTicket} onSubmit={handleCreateTicketSubmit} />
    </DashboardLayout>
  );
}
