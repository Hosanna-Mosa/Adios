import type { RefObject } from "react";
import { Bot, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FadeIn } from "@/components/motion/FadeIn";
import { SupportChatHeader } from "./SupportChatHeader";
import { SupportChatMessages } from "./SupportChatMessages";
import { SupportChatComposer } from "./SupportChatComposer";
import { SupportCancelOrder } from "./SupportCancelOrder";
import { InternalNotes } from "./InternalNotes";
import type { Ticket } from "../types";

interface SupportChatWindowProps {
  ticket: Ticket | undefined;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  typedMessage: string;
  onTypedMessageChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onResolve: () => void;
  onReopen: () => void;
}

/** The right-pane chat window: header, message history, and composer -- or an empty state when nothing is selected. */
export function SupportChatWindow({ ticket, messagesEndRef, typedMessage, onTypedMessageChange, onKeyDown, onSend, onResolve, onReopen }: SupportChatWindowProps) {
  const { t } = useTranslation();
  return (
    <div className="section-card flex flex-col h-full min-h-0 overflow-hidden lg:col-span-2">
      {ticket ? (
        <FadeIn key={ticket._id} className="flex flex-col flex-1 min-h-0">
          <SupportChatHeader ticket={ticket} onResolve={onResolve} onReopen={onReopen} />
          {ticket.botQuery && (
            <div className="mx-4 mt-3 rounded-xl border border-border bg-muted/40 p-3 text-xs space-y-1">
              <p className="flex items-center gap-1.5 font-semibold text-foreground">
                <Bot className="h-3.5 w-3.5 text-primary" /> {t("support.fromSupportBot")}
                {ticket.botQuery.helpful === false && <span className="text-destructive font-normal">· {t("support.botNotHelpful")}</span>}
              </p>
              <p><span className="text-muted-foreground">{t("support.botAsked")}:</span> {ticket.botQuery.question}</p>
              {ticket.botQuery.answer && <p><span className="text-muted-foreground">{t("support.botAnswered")}:</span> {ticket.botQuery.answer}</p>}
              {ticket.orderId && <p><span className="text-muted-foreground">{t("support.botOrder")}:</span> #{ticket.orderId}</p>}
            </div>
          )}
          {ticket.orderId && <SupportCancelOrder orderId={ticket.orderId} />}
          <SupportChatMessages messages={ticket.messages} messagesEndRef={messagesEndRef} />
          <InternalNotes ticketId={ticket._id} notes={ticket.internalNotes} />
          <SupportChatComposer value={typedMessage} onChange={onTypedMessageChange} onKeyDown={onKeyDown} onSend={onSend} placeholderName={ticket.user} />
        </FadeIn>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
          <MessageSquare className="h-12 w-12 text-muted-foreground/40 animate-pulse" />
          <div className="text-center">
            <p className="font-semibold text-foreground">{t("support.noActiveConversation")}</p>
            <p className="text-xs">{t("support.selectChatFromSidebarDesc")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
