import mongoose from "mongoose";
import Order from "../../database/models/Order";
import User from "../../database/models/User";
import Driver from "../../database/models/Driver";
import Vendor from "../../database/models/Vendor";
import MeatCenter from "../../database/models/MeatCenter";
import ChatMessage from "../../database/models/ChatMessage";
import SupportAuditLog, { SupportAuditAction } from "../../database/models/SupportAuditLog";
import { OrdersService } from "../orders/orders.service";
import { NotFoundError } from "../../utils/errors";
import {
  kindFilter,
  parseSearchTerm,
  statusGroupFilter,
  toSupportOrderRow,
  toSupportOrderView,
  type SupportOrderKind,
  type SupportOutlet,
  type SupportStatusGroup,
} from "./support.orders.view";

const ordersService = new OrdersService();

// How many people a free-text search may match before it stops looking. A name like
// "Ravi" can match thousands of customers; the agent should narrow the search instead.
const PARTY_MATCH_LIMIT = 50;

export interface SupportOrderSearch {
  q?: string;
  status?: SupportStatusGroup;
  kind?: SupportOrderKind;
  from?: string;
  to?: string;
  /** The ticket's owner, so a ticket can list that person's / outlet's orders. */
  customerId?: string;
  driverUserId?: string;
  vendorId?: string;
  page?: number;
  limit?: number;
}

interface Actor {
  userId: string;
  role: string;
}

// Orders created before custom ids existed are keyed by an ObjectId.
const orderIdQuery = (orderId: string): any =>
  mongoose.Types.ObjectId.isValid(orderId)
    ? { $or: [{ _id: orderId }, { _id: new mongoose.Types.ObjectId(orderId) }] }
    : { _id: orderId };

const validIds = (ids: unknown[]) => ids.map(String).filter((id) => mongoose.Types.ObjectId.isValid(id));

/** Recorded without blocking the agent: a failed audit write is logged, not surfaced. */
function audit(actor: Actor, action: SupportAuditAction, orderId: string | null, details?: Record<string, unknown>) {
  SupportAuditLog.create({ actor: actor.userId, actorRole: actor.role, action, orderId, details }).catch((err) =>
    console.error("Support audit log write failed:", err)
  );
}

/** `{ _id, name, phone, address, partnerType }` per outlet id, from Vendor or legacy MeatCenter. */
async function outletsById(ids: unknown[]): Promise<Map<string, SupportOutlet>> {
  const unique = [...new Set(validIds(ids.filter(Boolean)))];
  const result = new Map<string, SupportOutlet>();
  if (!unique.length) return result;
  const [vendors, meatCenters] = await Promise.all([
    Vendor.find({ _id: { $in: unique } }).select("name phone address partnerType").lean(),
    MeatCenter.find({ _id: { $in: unique } }).select("name phone address").lean(),
  ]);
  for (const v of vendors as any[]) {
    result.set(String(v._id), { _id: String(v._id), name: v.name, phone: v.phone, address: v.address, partnerType: v.partnerType === "meat" ? "meat" : "food" });
  }
  for (const m of meatCenters as any[]) {
    result.set(String(m._id), { _id: String(m._id), name: m.name, phone: m.phone, address: m.address, partnerType: "meat" });
  }
  return result;
}

/** The `$or` clauses a free-text term turns into: order id, or the people / outlets it names. */
async function searchTermClauses(q: string): Promise<Record<string, unknown>[]> {
  const { orderIdPattern, phoneDigits, namePattern } = parseSearchTerm(q);
  const clauses: Record<string, unknown>[] = [];
  if (orderIdPattern) clauses.push({ _id: { $regex: orderIdPattern } });

  const personMatch: Record<string, unknown>[] = [];
  const outletMatch: Record<string, unknown>[] = [];
  if (phoneDigits) {
    personMatch.push({ phone: { $regex: phoneDigits } });
    outletMatch.push({ phone: { $regex: phoneDigits } });
  }
  if (namePattern) {
    personMatch.push({ name: { $regex: namePattern, $options: "i" } });
    outletMatch.push({ name: { $regex: namePattern, $options: "i" } });
  }
  if (!personMatch.length) return clauses;

  const [users, vendors, meatCenters] = await Promise.all([
    User.find({ $or: personMatch }).select("_id").limit(PARTY_MATCH_LIMIT).lean(),
    Vendor.find({ $or: outletMatch }).select("_id").limit(PARTY_MATCH_LIMIT).lean(),
    MeatCenter.find({ $or: outletMatch }).select("_id").limit(PARTY_MATCH_LIMIT).lean(),
  ]);
  const userIds = users.map((u: any) => u._id);
  if (userIds.length) {
    clauses.push({ user: { $in: userIds } });
    const drivers = await Driver.find({ user: { $in: userIds } }).select("_id").lean();
    if (drivers.length) clauses.push({ driver: { $in: drivers.map((d: any) => d._id) } });
  }
  const outletIds = [...vendors, ...meatCenters].map((o: any) => o._id);
  if (outletIds.length) clauses.push({ vendor: { $in: outletIds } });
  return clauses;
}

export async function searchSupportOrders(params: SupportOrderSearch, actor: Actor) {
  const page = Math.max(1, Math.floor(params.page || 1));
  const limit = Math.min(50, Math.max(1, Math.floor(params.limit || 20)));
  const and: Record<string, unknown>[] = [];

  if (params.status) and.push(statusGroupFilter(params.status));
  if (params.kind) and.push(kindFilter(params.kind));
  if (params.from || params.to) {
    const createdAt: Record<string, Date> = {};
    if (params.from) createdAt.$gte = new Date(params.from);
    if (params.to) createdAt.$lte = new Date(params.to);
    and.push({ createdAt });
  }
  if (params.customerId) and.push({ user: params.customerId });
  if (params.vendorId) and.push({ vendor: params.vendorId });
  if (params.driverUserId) {
    const driver = await Driver.findOne({ user: params.driverUserId }).select("_id").lean();
    // A user who never drove has no orders as a driver.
    if (!driver) return { orders: [], total: 0, page, limit };
    and.push({ driver: driver._id });
  }

  const q = params.q?.trim();
  if (q) {
    const clauses = await searchTermClauses(q);
    if (!clauses.length) return { orders: [], total: 0, page, limit };
    and.push({ $or: clauses });
    audit(actor, "order.search", null, { q });
  }

  const filter = and.length ? { $and: and } : {};
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "name phone")
      .populate({ path: "driver", select: "user", populate: { path: "user", select: "name" } })
      .lean(),
    Order.countDocuments(filter),
  ]);
  const outlets = await outletsById(orders.map((o: any) => o.vendor));
  return {
    orders: orders.map((o: any) => toSupportOrderRow(o, o.vendor ? outlets.get(String(o.vendor)) : null)),
    total,
    page,
    limit,
  };
}

export async function getSupportOrder(orderId: string, actor: Actor) {
  const order: any = await Order.findOne(orderIdQuery(orderId))
    .populate("user", "name phone")
    .populate({ path: "driver", select: "user vehicleType", populate: { path: "user", select: "name phone" } })
    .lean();
  if (!order) throw new NotFoundError("Order not found");

  const outlets = await outletsById([order.vendor]);
  audit(actor, "order.view", String(order._id));
  return toSupportOrderView(order, {
    outlet: order.vendor ? outlets.get(String(order.vendor)) : null,
    items: ordersService.extractOrderItems(order),
  });
}

/** The customer ↔ driver chat on an order, read-only. Sender ids are not exposed. */
export async function getSupportOrderChat(orderId: string, actor: Actor) {
  const order: any = await Order.findOne(orderIdQuery(orderId)).select("_id").lean();
  if (!order) throw new NotFoundError("Order not found");
  const id = String(order._id);
  const messages = await ChatMessage.find({ orderId: id }).sort({ createdAt: 1 }).select("role text time createdAt").lean();
  audit(actor, "order.chat.view", id);
  return messages.map((m: any) => ({ role: m.role, text: m.text, time: m.time, createdAt: m.createdAt }));
}
