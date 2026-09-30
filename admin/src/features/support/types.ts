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
  // Widened from Support.tsx's original "OPEN" | "RESOLVED": SupportIssues.tsx
  // (work queue item #12), reading the same /admin/tickets data, shows a
  // real third status this type didn't account for.
  status: "OPEN" | "RESOLVED" | "PENDING_RESOLVE";
  message: string;
  user: string;
  // Used throughout the page's JSX (role badges on the ticket card and chat
  // header) but was missing from the original type -- added here since
  // it's a real field the page reads, not a new one.
  userRole?: string;
  time: string;
  createdAt: string;
  messages: TicketMessage[];
  /** The support member who owns the case (populated with their name by GET /admin/tickets). */
  assignedTo?: { _id: string; name: string } | null;
}

export interface NewTicketForm {
  title: string;
  category: string;
  message: string;
  user: string;
}

/** A SUPPORT-role account the admin created (GET /admin/support-members). */
export interface SupportMember {
  _id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  /** OPEN cases — these count toward caseLimit. */
  openCount: number;
  /** Cases waiting on the customer to confirm resolution — not counted toward the limit. */
  pendingCount: number;
  caseLimit: number;
}

export interface NewSupportMemberForm {
  name: string;
  email: string;
  password: string;
}
