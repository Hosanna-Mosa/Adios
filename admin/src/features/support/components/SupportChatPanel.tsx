import { MoreVertical } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FadeIn } from "@/components/motion/FadeIn";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChatMessageList } from "./ChatMessageList";
import { ChatComposer } from "./ChatComposer";
import type { Ticket } from "../types";

interface SupportChatPanelProps {
  ticket: Ticket | undefined;
  typedMessage: string;
  onTypedMessageChange: (value: string) => void;
  onSend: () => void;
  onResolve: () => void;
  onReopen: () => void;
}

/** The right-side resolution chat panel: header, message history, and composer. */
export function SupportChatPanel({ ticket, typedMessage, onTypedMessageChange, onSend, onResolve, onReopen }: SupportChatPanelProps) {
  const { t } = useTranslation();
  if (!ticket) {
    return <div className="flex-1 flex items-center justify-center text-muted-foreground">{t("support.selectTicketToStartChatDesc")}</div>;
  }

  return (
    <FadeIn key={ticket._id} className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
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
              <p className="text-sm font-semibold text-foreground">{ticket.user || t("support.platformUser")}</p>
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
              {ticket.title} • <span className="text-primary font-medium">{ticket.category}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors border border-border">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onResolve} className="cursor-pointer">
                {t("support.resolveCase")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onReopen} className="cursor-pointer">
                {t("support.reopenCase")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ChatMessageList messages={ticket.messages} />

      <ChatComposer value={typedMessage} onChange={onTypedMessageChange} onSend={onSend} placeholderName={ticket.user} />
    </FadeIn>
  );
}
