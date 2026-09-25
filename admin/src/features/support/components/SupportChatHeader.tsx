import { toast } from "sonner";
import { CheckCircle, Clock, MoreVertical, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Ticket } from "../types";

interface SupportChatHeaderProps {
  ticket: Ticket;
  onResolve: () => void;
  onReopen: () => void;
}

/** The selected ticket's chat-window header: avatar, name, role, category, call, and resolve/reopen actions. */
export function SupportChatHeader({ ticket, onResolve, onReopen }: SupportChatHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-muted/10 shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border border-primary/20">
            {ticket.user
              ? ticket.user
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              : "U"}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-card" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{ticket.user}</p>
            {ticket.userRole && (
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                  ticket.userRole === "DRIVER" ? "bg-green-100 text-green-800 border border-green-200" : "bg-purple-100 text-purple-800 border border-purple-200"
                }`}
              >
                {ticket.userRole}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {ticket.ticketId} • <span className="font-bold text-primary">{ticket.category}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => toast.success(t("support.callingUserConnectionEstablished", { name: ticket.user, defaultValue: "Calling {{name}}... Connection established." }))} className="p-2 hover:bg-muted rounded-xl transition-colors border border-border bg-card shadow-sm" title={t("support.callUser")}>
          <Phone className="h-4 w-4 text-muted-foreground" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-muted rounded-xl transition-colors border border-border bg-card shadow-sm">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem onClick={onResolve} className="cursor-pointer font-medium">
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              {t("support.resolveCase")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onReopen} className="cursor-pointer font-medium">
              <Clock className="mr-2 h-4 w-4 text-red-500" />
              {t("support.reopenCase")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
