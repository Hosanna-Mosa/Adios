// Service-level targets for support tickets: how long a customer may wait for the first staff reply
// and for the case to be resolved, by priority. Pure functions so the rules are unit-tested.

export const TICKET_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

/** Minutes. */
export const SLA_TARGETS: Record<TicketPriority, { firstResponse: number; resolution: number }> = {
  URGENT: { firstResponse: 15, resolution: 2 * 60 },
  HIGH: { firstResponse: 60, resolution: 8 * 60 },
  NORMAL: { firstResponse: 4 * 60, resolution: 24 * 60 },
  LOW: { firstResponse: 8 * 60, resolution: 72 * 60 },
};

export interface SlaInput {
  priority?: string | null;
  status?: string | null;
  createdAt?: Date | string | null;
  firstResponseAt?: Date | string | null;
  resolvedAt?: Date | string | null;
}

export type SlaState = "ok" | "due_soon" | "breached" | "met";

export interface TicketSla {
  priority: TicketPriority;
  firstResponseDueAt: Date | null;
  resolutionDueAt: Date | null;
  /** Minutes from creation to the first staff reply; null until there is one. */
  firstResponseMinutes: number | null;
  /** Minutes from creation to resolution; null while unresolved. */
  resolutionMinutes: number | null;
  firstResponse: SlaState;
  resolution: SlaState;
}

const toDate = (value?: Date | string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const normalizePriority = (value?: string | null): TicketPriority =>
  (TICKET_PRIORITIES as readonly string[]).includes(String(value)) ? (value as TicketPriority) : "NORMAL";

/** A timer is "due soon" in the last 20% of its allowance. */
function stateOf(start: Date, due: Date, done: Date | null, now: Date): SlaState {
  if (done) return done.getTime() <= due.getTime() ? "met" : "breached";
  if (now.getTime() > due.getTime()) return "breached";
  return due.getTime() - now.getTime() <= (due.getTime() - start.getTime()) * 0.2 ? "due_soon" : "ok";
}

export function computeSla(ticket: SlaInput, now: Date = new Date()): TicketSla | null {
  const created = toDate(ticket.createdAt);
  if (!created) return null;
  const priority = normalizePriority(ticket.priority);
  const target = SLA_TARGETS[priority];
  const firstResponseDueAt = new Date(created.getTime() + target.firstResponse * 60_000);
  const resolutionDueAt = new Date(created.getTime() + target.resolution * 60_000);
  const firstAt = toDate(ticket.firstResponseAt);
  const resolvedAt = ticket.status === "RESOLVED" ? toDate(ticket.resolvedAt) ?? now : null;
  return {
    priority,
    firstResponseDueAt,
    resolutionDueAt,
    firstResponseMinutes: firstAt ? Math.max(0, Math.round((firstAt.getTime() - created.getTime()) / 60_000)) : null,
    resolutionMinutes: resolvedAt ? Math.max(0, Math.round((resolvedAt.getTime() - created.getTime()) / 60_000)) : null,
    firstResponse: stateOf(created, firstResponseDueAt, firstAt, now),
    resolution: stateOf(created, resolutionDueAt, resolvedAt, now),
  };
}
