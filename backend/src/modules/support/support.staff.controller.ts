import { Response } from "express";
import { Types } from "mongoose";
import type { AuthRequest } from "../../middleware/auth.middleware";
import CannedReply from "../../database/models/CannedReply";
import SupportTicket from "../../database/models/SupportTicket";
import User, { UserRole } from "../../database/models/User";
import { recordAuditEvent } from "../../middleware/auditLog.middleware";
import { toCsv } from "./support.csv";
import {
  DEFAULT_SUPPORT_PERMISSIONS,
  SUPPORT_PERMISSIONS,
  cleanPermissions,
  effectivePermissions,
  permissionsOf,
} from "./support.permissions";
import { computeSla } from "./support.sla";

// Tools for the staff side of support: canned replies, internal notes, the ticket export and
// metrics, and what each support member is allowed to do. Mounted under /admin (admin.routes.ts).

const isSupport = (req: AuthRequest) => req.user?.role === UserRole.SUPPORT;
const fail = (res: Response, error: unknown, what: string) => {
  console.error(`[support.staff] ${what}:`, error);
  return res.status(500).json({ message: "Internal server error" });
};

/** Support members only ever see their own cases; admins see all. */
const visibleTickets = (req: AuthRequest, extra: Record<string, unknown> = {}) =>
  isSupport(req) ? { ...extra, assignedTo: req.user!.userId } : extra;

const dateRange = (query: AuthRequest["query"]) => {
  const range: Record<string, Date> = {};
  const from = typeof query.from === "string" ? Date.parse(query.from) : NaN;
  const to = typeof query.to === "string" ? Date.parse(query.to) : NaN;
  if (!Number.isNaN(from)) range.$gte = new Date(from);
  if (!Number.isNaN(to)) range.$lte = new Date(to);
  return Object.keys(range).length ? { createdAt: range } : {};
};

// --- Canned replies ---------------------------------------------------------

export const listCannedReplies = async (_req: AuthRequest, res: Response) => {
  try {
    return res.json(await CannedReply.find().sort({ category: 1, title: 1 }).lean());
  } catch (error) {
    return fail(res, error, "list canned replies");
  }
};

export const createCannedReply = async (req: AuthRequest, res: Response) => {
  try {
    const { title, body, category } = req.body;
    const author = await User.findById(req.user!.userId).select("name").lean<{ name?: string }>();
    const reply = await CannedReply.create({ title, body, category: category || undefined, createdBy: req.user!.userId, createdByName: author?.name });
    return res.status(201).json(reply);
  } catch (error) {
    return fail(res, error, "create canned reply");
  }
};

export const updateCannedReply = async (req: AuthRequest, res: Response) => {
  try {
    const { title, body, category } = req.body;
    const reply = await CannedReply.findByIdAndUpdate(req.params.id, { $set: { title, body, category: category || undefined } }, { new: true, runValidators: true });
    if (!reply) return res.status(404).json({ message: "Canned reply not found" });
    return res.json(reply);
  } catch (error) {
    return fail(res, error, "update canned reply");
  }
};

export const deleteCannedReply = async (req: AuthRequest, res: Response) => {
  try {
    const reply = await CannedReply.findByIdAndDelete(req.params.id);
    if (!reply) return res.status(404).json({ message: "Canned reply not found" });
    return res.json({ message: "Canned reply deleted" });
  } catch (error) {
    return fail(res, error, "delete canned reply");
  }
};

// --- Internal notes ---------------------------------------------------------

/** POST /admin/tickets/:id/notes — a private note on a case; the customer never receives it. */
export const addInternalNote = async (req: AuthRequest, res: Response) => {
  try {
    const ticket = await SupportTicket.findOne({ _id: req.params.id, ...visibleTickets(req) }).select("+internalNotes");
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    const author = await User.findById(req.user!.userId).select("name").lean<{ name?: string }>();
    ticket.internalNotes = [...(ticket.internalNotes ?? []), { authorId: req.user!.userId, authorName: author?.name || "Staff", text: req.body.text, createdAt: new Date() }];
    await ticket.save();
    return res.status(201).json({ internalNotes: ticket.internalNotes });
  } catch (error) {
    return fail(res, error, "add internal note");
  }
};

// --- Export and metrics -----------------------------------------------------

const lastStaffReplyText = (ticket: any) => [...(ticket.messages ?? [])].reverse().find((m: any) => m.sender === "admin")?.text ?? "";

/** GET /admin/tickets/export — a CSV of the tickets the caller may see, newest first. */
export const exportTickets = async (req: AuthRequest, res: Response) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const filter = visibleTickets(req, { ...dateRange(req.query), ...(status ? { status } : {}) });
    const tickets = await SupportTicket.find(filter).populate("assignedTo", "name").sort({ createdAt: -1 }).limit(5000).lean();
    const rows = tickets.map((t: any) => {
      const sla = computeSla(t);
      return [
        t.ticketId, t.title, t.category, t.status, t.priority ?? "NORMAL", t.user, t.userRole, t.assignedTo?.name ?? "", t.orderId ?? "",
        t.createdAt, t.firstResponseAt ?? "", sla?.firstResponseMinutes ?? "", t.resolvedAt ?? "", sla?.resolutionMinutes ?? "",
        sla?.firstResponse ?? "", sla?.resolution ?? "", (t.messages ?? []).length, lastStaffReplyText(t),
      ];
    });
    const csv = toCsv(
      ["Ticket", "Title", "Category", "Status", "Priority", "Raised by", "Role", "Assigned to", "Order", "Created", "First reply", "First reply (min)", "Resolved", "Resolution (min)", "First-reply SLA", "Resolution SLA", "Messages", "Last staff reply"],
      rows,
    );
    await recordAuditEvent(req, "EXPORT /admin/tickets/export", "SupportTicket", { rows: tickets.length, status, from: req.query.from, to: req.query.to });
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="support-tickets-${new Date().toISOString().slice(0, 10)}.csv"`);
    // A leading byte-order mark makes Excel read the file as UTF-8.
    return res.send(String.fromCharCode(0xfeff) + csv);
  } catch (error) {
    return fail(res, error, "export tickets");
  }
};

const average = (values: number[]) => (values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null);

/** GET /admin/tickets/metrics — volumes, response and resolution times, SLA breaches and each agent's backlog. */
export const ticketMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const tickets = await SupportTicket.find(visibleTickets(req, dateRange(req.query)))
      .select("status priority createdAt firstResponseAt resolvedAt assignedTo")
      .lean();
    const now = new Date();
    const byStatus: Record<string, number> = { OPEN: 0, PENDING_RESOLVE: 0, RESOLVED: 0 };
    const byPriority: Record<string, number> = { LOW: 0, NORMAL: 0, HIGH: 0, URGENT: 0 };
    const firstResponse: number[] = [];
    const resolution: number[] = [];
    let firstResponseBreached = 0;
    let resolutionBreached = 0;
    const backlog = new Map<string, number>();

    for (const t of tickets as any[]) {
      byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
      const sla = computeSla(t, now);
      if (!sla) continue;
      byPriority[sla.priority] += 1;
      if (sla.firstResponseMinutes != null) firstResponse.push(sla.firstResponseMinutes);
      if (t.status === "RESOLVED" && sla.resolutionMinutes != null) resolution.push(sla.resolutionMinutes);
      if (sla.firstResponse === "breached") firstResponseBreached += 1;
      if (sla.resolution === "breached") resolutionBreached += 1;
      if (t.status !== "RESOLVED") {
        const key = t.assignedTo ? String(t.assignedTo) : "unassigned";
        backlog.set(key, (backlog.get(key) ?? 0) + 1);
      }
    }

    const agentIds = [...backlog.keys()].filter((id) => Types.ObjectId.isValid(id));
    const names = agentIds.length ? await User.find({ _id: { $in: agentIds } }).select("name").lean() : [];
    const agentBacklog = [...backlog.entries()]
      .map(([id, open]) => ({ agentId: id, name: id === "unassigned" ? "Unassigned" : names.find((n) => String(n._id) === id)?.name ?? "Unknown", open }))
      .sort((a, b) => b.open - a.open);

    return res.json({
      total: tickets.length,
      byStatus,
      byPriority,
      avgFirstResponseMinutes: average(firstResponse),
      avgResolutionMinutes: average(resolution),
      firstResponseBreached,
      resolutionBreached,
      agentBacklog,
    });
  } catch (error) {
    return fail(res, error, "ticket metrics");
  }
};

// --- Permissions ------------------------------------------------------------

/** GET /admin/support-permissions — every permission, and which a new member gets by default. */
export const permissionCatalog = (_req: AuthRequest, res: Response) => res.json({ permissions: SUPPORT_PERMISSIONS, defaults: DEFAULT_SUPPORT_PERMISSIONS });

/** GET /admin/me/permissions — what the signed-in staff member may do, so the panel can hide the rest. */
export const myPermissions = async (req: AuthRequest, res: Response) => {
  try {
    return res.json({ role: req.user?.role, permissions: await permissionsOf(req) });
  } catch (error) {
    return fail(res, error, "own permissions");
  }
};

/** PUT /admin/support-members/:id/permissions — admin sets what a support member may do. */
export const setMemberPermissions = async (req: AuthRequest, res: Response) => {
  try {
    const member = await User.findOne({ _id: req.params.id, role: UserRole.SUPPORT });
    if (!member) return res.status(404).json({ message: "Support member not found" });
    member.supportPermissions = cleanPermissions(req.body.permissions);
    await member.save();
    return res.json({ _id: String(member._id), permissions: effectivePermissions(UserRole.SUPPORT, member.supportPermissions) });
  } catch (error) {
    return fail(res, error, "set member permissions");
  }
};
