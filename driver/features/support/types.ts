export interface ChatMessage {
  sender: "user" | "admin" | "system";
  time: string;
  text: string;
}

export interface SupportTicket {
  _id: string;
  ticketId: string;
  title: string;
  category: string;
  status: "OPEN" | "RESOLVED" | "PENDING_RESOLVE";
  message: string;
  messages: ChatMessage[];
  createdAt: string;
}
