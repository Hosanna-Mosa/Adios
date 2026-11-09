// Types and small helpers for the support tools: priority, SLA timers, internal notes, canned
// replies, metrics and staff permissions. The server decides all of these (backend/src/modules/support).

export type TicketPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export const TICKET_PRIORITIES: TicketPriority[] = ["LOW", "NORMAL", "HIGH", "URGENT"];

export type SlaState = "ok" | "due_soon" | "breached" | "met";

export interface TicketSla {
  priority: TicketPriority;
  firstResponseDueAt: string | null;
  resolutionDueAt: string | null;
  firstResponseMinutes: number | null;
  resolutionMinutes: number | null;
  firstResponse: SlaState;
  resolution: SlaState;
}

export interface InternalNote {
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface CannedReply {
  _id: string;
  title: string;
  body: string;
  category?: string;
}

export interface SupportMetrics {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  avgFirstResponseMinutes: number | null;
  avgResolutionMinutes: number | null;
  firstResponseBreached: number;
  resolutionBreached: number;
  agentBacklog: { agentId: string; name: string; open: number }[];
}

export const SUPPORT_PERMISSION_KEYS = ["reply", "resolve", "priority", "notes", "cancel_orders", "export", "manage_canned"] as const;
export type SupportPermission = (typeof SUPPORT_PERMISSION_KEYS)[number];

/** The abilities a new support member gets unless an admin changes them (matches the server default). */
export const DEFAULT_PERMISSIONS: SupportPermission[] = ["reply", "resolve", "priority", "notes", "cancel_orders"];

/** "45 min", "3 h 20 min", "2 d 4 h" — for response and resolution times. */
export function formatMinutes(minutes: number | null | undefined): string {
  if (minutes == null) return "—";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return minutes % 60 ? `${hours} h ${minutes % 60} min` : `${hours} h`;
  const days = Math.floor(hours / 24);
  return hours % 24 ? `${days} d ${hours % 24} h` : `${days} d`;
}

/** A canned reply's text for this customer: "{{name}}" becomes their first name. */
export function fillCannedReply(body: string, customerName?: string): string {
  const first = (customerName || "").trim().split(/\s+/)[0] || "there";
  return body.replace(/\{\{\s*name\s*\}\}/gi, first);
}
