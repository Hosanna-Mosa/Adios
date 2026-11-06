import { useState } from "react";
import { Headphones, UserPlus, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { useSupportTickets } from "@/features/support/hooks/useSupportTickets";
import { TicketStatusTabs } from "@/features/support/components/TicketStatusTabs";
import { TicketList } from "@/features/support/components/TicketList";
import { SupportChatPanel } from "@/features/support/components/SupportChatPanel";
import { useSupportMembers } from "@/features/support/hooks/useSupportMembers";
import { SupportMemberDialog } from "@/features/support/components/SupportMemberDialog";
import { SupportTeamPanel } from "@/features/support/components/SupportTeamPanel";

export default function Support() {
  const { t } = useTranslation();
  const {
    activeTab,
    setActiveTab,
    ticketsList,
    filteredTickets,
    isLoading,
    isFetching,
    refetch,
    selectedTicket,
    setActiveTicketId,
    typedMessage,
    setTypedMessage,
    handleSendMessage,
    handleResolve,
    handleReopen,
  } = useSupportTickets();
  const { isAdmin, members, isLoading: membersLoading, createMember, resetPassword, removeMember } = useSupportMembers();
  const [pageTab, setPageTab] = useState<"tickets" | "team">("tickets");
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  return (
    <DashboardLayout searchPlaceholder={t("support.searchLogisticsCases")}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-header">{t("support.supportResolution")}</h1>
            <p className="page-subtitle">{t("support.manageCustomerQueriesDesc")}</p>
          </div>
          <div className="flex items-center gap-3">
            <RefreshButton onRefresh={() => refetch()} isRefreshing={isFetching} label={t("common.refresh")} />
            {isAdmin && (
              <button
                onClick={() => setIsAddMemberOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-primary/30 text-primary rounded-lg text-sm font-semibold hover:bg-primary/5 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                {t("supportTeam.addNewMember", "Add new member")}
              </button>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="inline-flex rounded-xl border border-border bg-card p-1 gap-1">
            {([
              { key: "tickets", label: t("supportTeam.ticketsTab", "Tickets"), icon: Headphones },
              { key: "team", label: t("supportTeam.teamTab", { count: members.length, defaultValue: "Support team ({{count}})" }), icon: Users },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setPageTab(key)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  pageTab === key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        )}

        {isAdmin && pageTab === "team" ? (
          <SupportTeamPanel
            members={members}
            isLoading={membersLoading}
            resetPassword={resetPassword}
            removeMember={removeMember}
            onAddMember={() => setIsAddMemberOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-2 gap-6 h-[calc(100vh-210px)] min-h-[480px]">
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
        )}
      </div>

      {isAdmin && (
        <SupportMemberDialog
          mode="create"
          open={isAddMemberOpen}
          onOpenChange={setIsAddMemberOpen}
          onSubmit={(form) =>
            createMember.mutateAsync(form).then(() => {
              setPageTab("team");
            })
          }
        />
      )}
    </DashboardLayout>
  );
}
