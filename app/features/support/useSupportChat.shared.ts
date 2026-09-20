

// Module-level values shared by the parts of useSupportChat.

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
  updatedAt: string;
}

export // The `category` field is free text on the backend — these four are simply
// the ones already seeded/expected by the admin dashboard's own icon
// matching (admin/src/pages/Support.tsx keys off "BILLING", "QUALITY", etc.
// in the category string), so they're kept exactly as-is rather than
// adopting the mockup's own wording, which would silently break that
// matching for every ticket raised from this screen.
const CATEGORIES = [
  { label: "Operational issue", value: "OPERATIONAL ISSUE" },
  { label: "Delayed delivery", value: "DELAYED DELIVERY" },
  { label: "Quality control", value: "QUALITY CONTROL" },
  { label: "Billing adjustment", value: "BILLING ADJUSTMENT" },
];
