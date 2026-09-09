export interface TicketMessage {
  sender: "user" | "admin" | "system";
  time: string;
  text: string;
}

export interface Ticket {
  _id: string;
  ticketId: string;
  title: string;
  category: string;
  status: "OPEN" | "RESOLVED";
  message: string;
  user: string;
  // Used throughout the page's JSX (role badges on the ticket card and chat
  // header) but was missing from the original type -- added here since
  // it's a real field the page reads, not a new one.
  userRole?: string;
  time: string;
  messages: TicketMessage[];
}

export interface NewTicketForm {
  title: string;
  category: string;
  message: string;
  user: string;
}
