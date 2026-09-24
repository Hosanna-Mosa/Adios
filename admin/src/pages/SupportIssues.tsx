import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useSupportIssues } from "@/features/support/hooks/useSupportIssues";
import { SupportIssuesStats } from "@/features/support/components/SupportIssuesStats";
import { TicketControlsBar } from "@/features/support/components/TicketControlsBar";
import { TicketCardGrid } from "@/features/support/components/TicketCardGrid";
import { CreateTicketDialog } from "@/features/support/components/CreateTicketDialog";

export default function SupportIssues() {
  const { t } = useTranslation();
  const {
    activeTab,
    setActiveTab,
    ticketsList,
    filteredTickets,
    isLoading,
    isCreateOpen,
    setIsCreateOpen,
    newTicket,
    setNewTicket,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    handleCreateTicketSubmit,
    navigateToChat,
  } = useSupportIssues();

  const activeCount = ticketsList.filter((t) => t.status === "OPEN" || t.status === "PENDING_RESOLVE").length;
  const resolvedCount = ticketsList.filter((t) => t.status === "RESOLVED").length;

  return (
    <DashboardLayout searchPlaceholder={t("support.searchTickets")}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-header">{t("support.supportCases")}</h1>
            <p className="page-subtitle">{t("support.trackFilterResolveDesc")}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => toast.success(t("support.systemAuditLogsExported"))}
              className="px-5 py-2.5 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors shadow-sm"
            >
              {t("support.exportLogs")}
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" /> {t("support.createTicket")}
            </button>
          </div>
        </div>

        <SupportIssuesStats activeCount={activeCount} pendingCount={ticketsList.filter((t) => t.status === "PENDING_RESOLVE").length} resolvedCount={resolvedCount} />

        <div className="section-card flex flex-col min-h-[500px]">
          <TicketControlsBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            activeCount={activeCount}
            resolvedCount={resolvedCount}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
          />

          <div className="flex-1 overflow-auto p-4">
            <TicketCardGrid tickets={filteredTickets} isLoading={isLoading} onOpenChat={navigateToChat} />
          </div>
        </div>
      </div>

      <CreateTicketDialog isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} newTicket={newTicket} onChange={setNewTicket} onSubmit={handleCreateTicketSubmit} />
    </DashboardLayout>
  );
}
