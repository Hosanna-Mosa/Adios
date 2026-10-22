import { Response } from "express";
import type { Model } from "mongoose";
import type { AuthRequest } from "../../middleware/auth.middleware";
import { recordAuditEvent } from "../../middleware/auditLog.middleware";
import Driver from "../../database/models/Driver";
import Order from "../../database/models/Order";
import User, { UserRole } from "../../database/models/User";
import Vendor from "../../database/models/Vendor";
import { toCsv } from "../support/support.csv";

// GET /admin/reports/:kind — CSV exports of orders, drivers, users and vendors for the admin panel
// (payments have their own export). Admin only, capped, and every download is written to the audit
// trail, because these files hold customers' and partners' personal details.

const MAX_ROWS = 20000;

interface ReportSpec {
  model: Model<any>;
  header: string[];
  /** Mongoose populate / select to run before mapping. */
  populate?: { path: string; select: string }[];
  row: (doc: any) => unknown[];
  extraFilter?: Record<string, unknown>;
}

const REPORTS: Record<string, ReportSpec> = {
  orders: {
    model: Order,
    populate: [
      { path: "user", select: "name phone" },
      { path: "vendor", select: "name" },
    ],
    header: ["Order", "Created", "Service", "Status", "Total", "Payment method", "Payment status", "Customer", "Customer phone", "Outlet", "Distance (km)"],
    row: (o) => [o._id, o.createdAt, o.serviceType, o.status, o.totalPrice, o.paymentMethod, o.paymentStatus, o.user?.name, o.user?.phone, o.vendor?.name, o.totalDistance],
  },
  drivers: {
    model: Driver,
    populate: [{ path: "user", select: "name phone email isBlocked" }],
    header: ["Driver", "Name", "Phone", "Email", "Vehicle", "Status", "Onboarding", "Online", "Blocked", "Created"],
    row: (d) => [d._id, d.user?.name, d.user?.phone, d.user?.email, d.vehicleType, d.status, d.onboardingStatus, d.isAvailable, d.user?.isBlocked ?? false, d.createdAt],
  },
  users: {
    model: User,
    extraFilter: { role: UserRole.USER },
    header: ["User", "Name", "Phone", "Email", "Blocked", "Deleted", "Created"],
    row: (u) => [u._id, u.name, u.phone, u.email, u.isBlocked ?? false, !!u.deletedAt, u.createdAt],
  },
  vendors: {
    model: Vendor,
    header: ["Vendor", "Name", "Type", "Phone", "Email", "Address", "Rating", "Open", "Created"],
    row: (v) => [v._id, v.name, v.partnerType, v.phone, v.email, v.address, v.rating, v.isOpen, v.createdAt],
  },
};

export const REPORT_KINDS = Object.keys(REPORTS);

export const downloadReport = async (req: AuthRequest, res: Response) => {
  try {
    const spec = REPORTS[String(req.params.kind)];
    if (!spec) return res.status(404).json({ message: `Unknown report. Choose one of: ${REPORT_KINDS.join(", ")}` });

    const range: Record<string, Date> = {};
    const from = typeof req.query.from === "string" ? Date.parse(req.query.from) : NaN;
    const to = typeof req.query.to === "string" ? Date.parse(req.query.to) : NaN;
    if (!Number.isNaN(from)) range.$gte = new Date(from);
    if (!Number.isNaN(to)) range.$lte = new Date(to);
    const filter = { ...(spec.extraFilter ?? {}), ...(Object.keys(range).length ? { createdAt: range } : {}) };

    let query = spec.model.find(filter).sort({ createdAt: -1 }).limit(MAX_ROWS);
    for (const p of spec.populate ?? []) query = query.populate(p.path, p.select);
    const docs = await query.lean();

    await recordAuditEvent(req, `EXPORT /admin/reports/${req.params.kind}`, String(req.params.kind), { rows: docs.length, from: req.query.from, to: req.query.to });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${req.params.kind}-${new Date().toISOString().slice(0, 10)}.csv"`);
    // A leading byte-order mark makes Excel read the file as UTF-8 (Telugu / Hindi names).
    return res.send(String.fromCharCode(0xfeff) + toCsv(spec.header, docs.map(spec.row)));
  } catch (error) {
    console.error("[admin.reports] export failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
