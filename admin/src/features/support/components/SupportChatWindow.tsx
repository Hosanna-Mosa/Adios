import type { RefObject } from "react";
import { MessageSquare } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { SupportChatHeader } from "./SupportChatHeader";
import { SupportChatMessages } from "./SupportChatMessages";
import { SupportChatComposer } from "./SupportChatComposer";
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
  return (
    <div className="section-card flex flex-col h-full lg:col-span-2">
      {ticket ? (
        <FadeIn key={ticket._id} className="flex flex-col flex-1 min-h-0">
          <SupportChatHeader ticket={ticket} onResolve={onResolve} onReopen={onReopen} />
          <SupportChatMessages messages={ticket.messages} messagesEndRef={messagesEndRef} />
          <SupportChatComposer value={typedMessage} onChange={onTypedMessageChange} onKeyDown={onKeyDown} onSend={onSend} placeholderName={ticket.user} />
        </FadeIn>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
          <MessageSquare className="h-12 w-12 text-muted-foreground/40 animate-pulse" />
          <div className="text-center">
            <p className="font-semibold text-foreground">No active conversation</p>
            <p className="text-xs">Select a chat from the sidebar, or go back to the issues list.</p>
          </div>
        </div>
      )}
    </div>
  );
}
