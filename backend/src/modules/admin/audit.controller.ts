import { Request, Response } from "express";
import AdminAuditLog from "../../database/models/AdminAuditLog";

import { escapeRegex } from "../food/food.search";
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

/** Builds the filter shared by the list and the CSV export. */
export const auditFilter = (query: Request["query"]) => {
  const filter: Record<string, unknown> = {};
  const actor = str(query.actor);
  if (actor) filter.$or = [{ actorId: actor }, { actorName: new RegExp(escapeRegex(actor), "i") }];
  const action = str(query.action);
  if (action) filter.action = new RegExp(escapeRegex(action), "i");
  const targetType = str(query.targetType);
  if (targetType) filter.targetType = targetType;
  const targetId = str(query.targetId);
  if (targetId) filter.targetId = targetId;
  const range: Record<string, Date> = {};
  const from = str(query.from);
  const to = str(query.to);
  if (from && !Number.isNaN(Date.parse(from))) range.$gte = new Date(from);
  if (to && !Number.isNaN(Date.parse(to))) range.$lte = new Date(to);
  if (Object.keys(range).length) filter.createdAt = range;
  return filter;
};

/** GET /admin/audit-logs — newest first. Read-only: there is no way to change or delete an entry. */
export const listAuditLogs = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
    const filter = auditFilter(req.query);
    const [items, total] = await Promise.all([
      AdminAuditLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      AdminAuditLog.countDocuments(filter),
    ]);
    return res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) {
    console.error("Error listing audit logs:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
