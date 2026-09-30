import { AlertCircle, CreditCard, Box, Package, MessageSquare, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import type { Ticket } from "../types";
import { ticketStatusLabel } from "../ticketLabels";
import { AssigneeBadge } from "./AssigneeBadge";

interface TicketCardGridProps {
  tickets: Ticket[];
  isLoading: boolean;
  onOpenChat: (ticketId: string) => void;
}

/** The grid of ticket cards on SupportIssues -- a 2-column card grid, distinct from Support.tsx's single-column list. */
export function TicketCardGrid({ tickets, isLoading, onOpenChat }: TicketCardGridProps) {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <div className="py-20 text-center text-muted-foreground font-medium flex flex-col items-center justify-center gap-2">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        {t("support.loadingSupportCases")}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <AlertCircle className="h-10 w-10 text-muted-foreground/60 mx-auto mb-2" />
        <p className="font-semibold text-foreground">{t("support.noCasesFound")}</p>
        <p className="text-xs mt-1">{t("support.tryModifyingFiltersDesc")}</p>
      </div>
    );
  }

  return (
    <StaggerList className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {tickets.map((ticket) => {
        const isActive = ticket.status === "OPEN" || ticket.status === "PENDING_RESOLVE";
        return (
          <StaggerItem key={ticket._id} className="rounded-2xl p-5 border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary font-mono">{ticket.ticketId}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ticket.status === "OPEN" ? "bg-red-100 text-red-700" : ticket.status === "PENDING_RESOLVE" ? "bg-amber-100 text-amber-700 animate-pulse" : "bg-green-100 text-green-700"
                    }`}
                  >
                    {ticketStatusLabel(ticket.status, t)}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">{ticket.time || t("support.recently")}</span>
              </div>

              <h4 className="text-sm font-bold text-foreground mt-2 line-clamp-1">{ticket.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="p-1 rounded bg-muted">
                  {ticket.category.includes("BILLING") || ticket.category.includes("ADJUSTMENT") ? (
                    <CreditCard className="h-3 w-3 text-destructive" />
                  ) : ticket.category.includes("QUALITY") ? (
                    <Box className="h-3 w-3 text-warning" />
                  ) : (
                    <Package className="h-3 w-3 text-primary" />
                  )}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{ticket.category}</span>
              </div>
              <div className="mt-2">
                <AssigneeBadge assignedTo={ticket.assignedTo} />
              </div>

              <p className="text-xs text-muted-foreground mt-3 line-clamp-2 italic">{ticket.message ? ticket.message.replace(/^"|"$/g, "") : t("support.noDescriptionProvided")}</p>
            </div>

            <div className="flex items-center justify-between border-t border-border mt-4 pt-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">
                  {ticket.user
                    ? ticket.user
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "U"}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground">{ticket.user}</span>
                  {ticket.userRole && <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">{ticket.userRole}</span>}
                </div>
              </div>

              <button
                onClick={() => onOpenChat(ticket._id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                  isActive ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-muted text-foreground hover:bg-muted/70"
                }`}
              >
                {isActive ? (
                  <>
                    <MessageSquare className="h-3.5 w-3.5" /> {t("support.openChat")}
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" /> {t("support.viewChat")}
                  </>
                )}
              </button>
            </div>
          </StaggerItem>
        );
      })}
    </StaggerList>
  );
}
