import { AlertCircle, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import type { Ticket } from "../types";

interface SupportChatSidebarProps {
  tickets: Ticket[];
  isLoading: boolean;
  selectedTicketId: string | undefined;
  onSelect: (ticketId: string) => void;
}

/** The "Active Chats" sidebar list on SupportChat -- its own card design, distinct from Support.tsx's TicketList and SupportIssues' TicketCardGrid. */
export function SupportChatSidebar({ tickets, isLoading, selectedTicketId, onSelect }: SupportChatSidebarProps) {
  const { t } = useTranslation();
  return (
    <div className="section-card flex flex-col h-full min-h-0 overflow-hidden lg:col-span-1">
      <div className="p-4 border-b border-border bg-muted/10 flex items-center justify-between shrink-0">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="h-4.5 w-4.5 text-primary" /> {t("support.activeChatsCount", { count: tickets.length, defaultValue: "Active Chats ({{count}})" })}
        </h3>
      </div>

      <StaggerList className="flex-1 overflow-auto p-3 space-y-2">
        {isLoading ? (
          <div className="py-10 text-center text-muted-foreground font-medium flex flex-col items-center justify-center gap-2">
            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            {t("support.loadingChats")}
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
            <p className="font-semibold text-foreground">{t("support.noActiveChats")}</p>
            <p className="text-[11px] mt-0.5">{t("support.allTicketsResolvedOrPendingDesc")}</p>
          </div>
        ) : (
          tickets.map((ticket) => {
            const isCurrent = ticket._id === selectedTicketId;
            const lastMessage = ticket.messages[ticket.messages.length - 1];

            return (
              <StaggerItem
                key={ticket._id}
                onClick={() => onSelect(ticket._id)}
                className={`rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                  isCurrent ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card hover:bg-muted/30"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[11px] font-bold text-primary font-mono shrink-0">{ticket.ticketId}</span>
                    <h4 className="text-xs font-bold text-foreground truncate min-w-0">{ticket.title}</h4>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase shrink-0 ${
                      ticket.status === "PENDING_RESOLVE" ? "bg-amber-100 text-amber-700 animate-pulse" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {ticket.status === "PENDING_RESOLVE" ? t("support.pendingShort") : t("support.statusOpen")}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mt-2 line-clamp-1 italic">{lastMessage ? lastMessage.text : ticket.message}</p>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/40">
                  <span className="text-[10px] text-muted-foreground truncate font-medium">
                    {ticket.user} ({ticket.userRole || t("support.userShort")})
                  </span>
                  <span className="text-[9px] text-muted-foreground shrink-0 font-medium">{ticket.time || t("support.recently")}</span>
                </div>
              </StaggerItem>
            );
          })
        )}
      </StaggerList>
    </div>
  );
}
