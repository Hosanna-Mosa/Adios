import type { RefObject } from "react";
import type { TicketMessage } from "../types";

interface SupportChatMessagesProps {
  messages: TicketMessage[] | undefined;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

/** The chat window's message history, with a scroll anchor for auto-scroll-to-bottom on new messages. */
export function SupportChatMessages({ messages, messagesEndRef }: SupportChatMessagesProps) {
  return (
    <div className="flex-1 overflow-auto p-4 space-y-4 bg-muted/5">
      {messages &&
        messages.map((msg, index) => {
          if (msg.sender === "system") {
            return (
              <div key={index} className="flex justify-center my-2">
                <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-wider border border-border/55">
                  {msg.time} {msg.text ? `• ${msg.text}` : ""}
                </span>
              </div>
            );
          }

          const isAdmin = msg.sender === "admin";
          return (
            <div key={index} className={`max-w-[80%] ${isAdmin ? "ml-auto" : ""}`}>
              <div
                className={`rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                  isAdmin ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card text-foreground rounded-bl-sm border border-border"
                }`}
              >
                <p>{msg.text}</p>
              </div>
              <p className={`text-[10px] text-muted-foreground mt-1 px-1 ${isAdmin ? "text-right" : ""}`}>
                {msg.time} {isAdmin && "✓✓"}
              </p>
            </div>
          );
        })}
      <div ref={messagesEndRef} />
    </div>
  );
}
