import { MessageBubble } from "./MessageBubble";
import type { TicketMessage } from "../types";

interface ChatMessageListProps {
  messages: TicketMessage[] | undefined;
}

/** The scrollable message history for the selected ticket. */
export function ChatMessageList({ messages }: ChatMessageListProps) {
  return (
    <div className="flex-1 overflow-auto p-4 space-y-4">
      {messages && messages.map((msg, index) => <MessageBubble key={index} message={msg} />)}
    </div>
  );
}
