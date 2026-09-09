import { CreditCard, Box, Package } from "lucide-react";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import type { Ticket } from "../types";

interface TicketListProps {
  tickets: Ticket[];
  isLoading: boolean;
  selectedTicketId: string | undefined;
  onSelect: (ticketId: string) => void;
}

/** The scrollable list of ticket cards (not a table -- the original page never used one). */
export function TicketList({ tickets, isLoading, selectedTicketId, onSelect }: TicketListProps) {
  return (
    <StaggerList className="flex-1 overflow-auto p-4 space-y-3">
      {isLoading ? (
        <div className="py-10 text-center text-muted-foreground">Loading support cases...</div>
      ) : tickets.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground">No cases found in this category.</div>
      ) : (
        tickets.map((ticket) => (
          <StaggerItem
            key={ticket._id}
            onClick={() => onSelect(ticket._id)}
            className={`rounded-2xl p-4 border transition-all cursor-pointer ${
              ticket._id === selectedTicketId ? "border-primary bg-primary/5 shadow-md" : "border-border hover:bg-muted/30"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {ticket.category.includes("BILLING") || ticket.category.includes("ADJUSTMENT") ? (
                    <CreditCard className="h-5 w-5 text-destructive" />
                  ) : ticket.category.includes("QUALITY") ? (
                    <Box className="h-5 w-5 text-warning" />
                  ) : (
                    <Package className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{ticket.title}</p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ticket.status === "OPEN" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>{ticket.status}</span>
                    {ticket.userRole && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          ticket.userRole === "DRIVER" ? "bg-green-100 text-green-800 border border-green-200" : "bg-purple-100 text-purple-800 border border-purple-200"
                        }`}
                      >
                        {ticket.userRole}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-0.5">{ticket.category}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{ticket.message}</p>
            {ticket.user && (
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-foreground">
                    {ticket.user
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    User: {ticket.user} {ticket.userRole ? `(${ticket.userRole})` : ""}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{ticket.time}</span>
              </div>
            )}
          </StaggerItem>
        ))
      )}
    </StaggerList>
  );
}
