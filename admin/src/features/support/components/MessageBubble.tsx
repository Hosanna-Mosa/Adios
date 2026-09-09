import type { TicketMessage } from "../types";

interface MessageBubbleProps {
  message: TicketMessage;
}

/** One chat message: a centered pill for system messages, a bubble for user/admin ones. */
export function MessageBubble({ message }: MessageBubbleProps) {
  if (message.sender === "system") {
    return (
      <div className="flex justify-center">
        <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{message.time}</span>
      </div>
    );
  }

  const isAdmin = message.sender === "admin";
  return (
    <div className={`max-w-[85%] ${isAdmin ? "ml-auto" : ""}`}>
      <div className={`${isAdmin ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"} rounded-2xl p-4`}>
        <p className="text-sm leading-relaxed">{message.text}</p>
      </div>
      <p className={`text-[10px] text-muted-foreground mt-1 ${isAdmin ? "text-right" : ""}`}>
        {message.time} {isAdmin && "✓✓"}
      </p>
    </div>
  );
}
