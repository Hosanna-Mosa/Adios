import { Types } from "mongoose";
import SupportTicket, { ISupportTicket } from "../database/models/SupportTicket";
import User, { UserRole } from "../database/models/User";
import { SocketManager } from "../sockets/socket.manager";

/**
 * How support cases are shared out among SUPPORT members:
 *
 * - A member is "full" at SUPPORT_CASE_LIMIT OPEN cases. Cases waiting on the
 *   customer to confirm resolution (PENDING_RESOLVE) don't count, so 6 cases
 *   with one pending counts as 5 and the member can take another.
 * - A new case goes to the member with the fewest OPEN cases; ties go to the
 *   longest-standing member.
 * - When every member is full, the case goes to the first (longest-standing)
 *   member anyway, so nothing is ever left unowned while members exist.
 * - A member keeps their cases through re-opens. When a member is removed their
 *   unresolved cases are handed out again by the same rule.
 */
export const SUPPORT_CASE_LIMIT = 6;

// Picking an assignee reads everyone's load and then writes one ticket; two
// cases arriving together must not both see the same free slot. Assignments
// are serialized through this chain. It is per-process, which matches this
// backend's single-instance deployment.
let assignmentChain: Promise<unknown> = Promise.resolve();

function serialized<T>(task: () => Promise<T>): Promise<T> {
  const run = assignmentChain.then(task, task);
  assignmentChain = run.catch(() => undefined);
  return run;
}

/** Each SUPPORT member (oldest first) with their OPEN and PENDING_RESOLVE counts. */
export async function getSupportWorkloads() {
  const members = await User.find({ role: UserRole.SUPPORT }).select("_id name createdAt").sort({ createdAt: 1, _id: 1 }).lean();
  if (members.length === 0) return [];

  const counts = await SupportTicket.aggregate<{ _id: { member: Types.ObjectId; status: string }; count: number }>([
    { $match: { assignedTo: { $in: members.map((m) => m._id) }, status: { $in: ["OPEN", "PENDING_RESOLVE"] } } },
    { $group: { _id: { member: "$assignedTo", status: "$status" }, count: { $sum: 1 } } },
  ]);

  return members.map((member) => {
    const countFor = (status: string) =>
      counts.find((c) => c._id.member.equals(member._id) && c._id.status === status)?.count ?? 0;
    return { memberId: member._id, openCount: countFor("OPEN"), pendingCount: countFor("PENDING_RESOLVE") };
  });
}

async function pickAssignee(): Promise<Types.ObjectId | null> {
  const workloads = await getSupportWorkloads();
  if (workloads.length === 0) return null;

  // Stable sort keeps the oldest member first among equal loads.
  const withRoom = workloads.filter((w) => w.openCount < SUPPORT_CASE_LIMIT).sort((a, b) => a.openCount - b.openCount);
  return (withRoom[0] ?? workloads[0]).memberId;
}

/** Assigns an unsaved (or re-queued) ticket to a support member and saves it. */
export function assignAndSaveTicket(ticket: ISupportTicket) {
  return serialized(async () => {
    const assignee = await pickAssignee();
    ticket.assignedTo = assignee;
    ticket.assignedAt = assignee ? new Date() : null;
    await ticket.save();
    return ticket;
  });
}

/**
 * Hands out every unresolved case with no owner, oldest first — used when a
 * member is added (cases that arrived while nobody was on the team), when one is
 * removed, and by scripts/assign-support-tickets.ts for tickets that predate assignment.
 */
export async function assignUnownedTickets() {
  const liveMemberIds = (await User.find({ role: UserRole.SUPPORT }).select("_id").lean()).map((m) => m._id);
  if (liveMemberIds.length === 0) return 0;

  const unowned = await SupportTicket.find({
    status: { $in: ["OPEN", "PENDING_RESOLVE"] },
    $or: [{ assignedTo: null }, { assignedTo: { $nin: liveMemberIds } }],
  }).sort({ createdAt: 1 });

  for (const ticket of unowned) {
    await assignAndSaveTicket(ticket);
    emitTicketUpdate(ticket);
  }
  return unowned.length;
}

/**
 * Pushes a ticket change to everyone allowed to see it: admins (the
 * support_tickets room), the assigned member, and the customer/driver who raised it.
 * Support members are deliberately not in support_tickets, so they never receive
 * other members' cases.
 */
export function emitTicketUpdate(ticket: ISupportTicket) {
  try {
    // No instance outside the HTTP server (e.g. the backfill script) — nothing to push to.
    const io = SocketManager.getInstance()?.getIo();
    if (!io) return;
    let target = io.to("support_tickets");
    if (ticket.assignedTo) target = target.to(ticket.assignedTo.toString());
    if (ticket.userId) target = target.to(ticket.userId.toString());
    target.emit("ticket_updated", ticket);
  } catch (err) {
    console.error("Socket emit support update error:", err);
  }
}
