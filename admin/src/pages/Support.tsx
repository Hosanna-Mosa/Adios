import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useSupportTickets } from "@/features/support/hooks/useSupportTickets";
import { TicketStatusTabs } from "@/features/support/components/TicketStatusTabs";
import { TicketList } from "@/features/support/components/TicketList";
import { SupportChatPanel } from "@/features/support/components/SupportChatPanel";
import { CreateTicketDialog } from "@/features/support/components/CreateTicketDialog";

export default function Support() {
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
    <DashboardLayout searchPlaceholder="Search logistics cases...">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-header">Support Resolution</h1>
            <p className="page-subtitle">Manage customer queries and real-time logistics escalations.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => toast.success("System audit support logs exported as CSV!")}
              className="px-5 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
            >
              Export Logs
            </button>
            <button onClick={() => setIsCreateOpen(true)} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
              Create Ticket
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
