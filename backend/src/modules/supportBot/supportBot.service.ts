import Order, { ServiceType } from "../../database/models/Order";
import SupportBotQuery from "../../database/models/SupportBotQuery";
import SupportIntent, { SUPPORT_INTENT_CATEGORIES, type ISupportIntent } from "../../database/models/SupportIntent";
import SystemConfig from "../../database/models/SystemConfig";
import Vendor from "../../database/models/Vendor";
import MeatCenter from "../../database/models/MeatCenter";
import { SupportBotQueue } from "../../services/supportBot.queue";
import { createSupportTicket, resolveTicketOwner } from "../../services/supportTicket.service";
import { AppError, NotFoundError } from "../../utils/errors";
import { normalizeLang } from "./answers";
import { normalizeStatus } from "./resolvers";

export const DEFAULT_MAX_UNHELPFUL = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000;
const ORDER_CATEGORIES = ["ride", "food", "meat", "package", "helper"] as const;
type OrderCategory = (typeof ORDER_CATEGORIES)[number];

export async function getMaxUnhelpful(): Promise<number> {
  const config: any = await SystemConfig.findOne({ key: "global_settings" }).lean();
  const n = Number(config?.value?.supportBot?.maxUnhelpfulAnswers);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : DEFAULT_MAX_UNHELPFUL;
}

export async function getLimitState(userId: string) {
  const [max, used] = await Promise.all([
    getMaxUnhelpful(),
    SupportBotQuery.countDocuments({ user: userId, helpful: false, createdAt: { $gte: new Date(Date.now() - WINDOW_MS) } }),
  ]);
  const remaining = Math.max(0, max - used);
  return { limitReached: remaining === 0, remaining, max };
}

/** Which bot category an order belongs to. Food vs meat needs the vendor's partnerType. */
export async function orderCategories(orders: any[]): Promise<Map<string, OrderCategory>> {
  const vendorIds = [...new Set(orders.filter((o) => o.vendor).map((o) => String(o.vendor)))];
  const [vendors, centers] = vendorIds.length
    ? await Promise.all([
        Vendor.find({ _id: { $in: vendorIds } }).select("partnerType").lean(),
        MeatCenter.find({ _id: { $in: vendorIds } }).select("_id").lean(),
      ])
    : [[], []];
  const partnerType = new Map<string, string>();
  vendors.forEach((v: any) => partnerType.set(String(v._id), v.partnerType === "meat" ? "meat" : "food"));
  centers.forEach((c: any) => partnerType.set(String(c._id), "meat"));

  const result = new Map<string, OrderCategory>();
  for (const o of orders) {
    let category: OrderCategory;
    if (o.serviceType === ServiceType.HELPER) category = "helper";
    else if (o.vendor) category = (partnerType.get(String(o.vendor)) as OrderCategory) || "food";
    else if (o.packageDelivery || o.serviceType === ServiceType.DELIVERY) category = "package";
    else category = "ride";
    result.set(String(o._id), category);
  }
  return result;
}

export async function listIntents(userId: string, langInput: unknown) {
  const lang = normalizeLang(langInput);
  const [intents, limit] = await Promise.all([
    SupportIntent.find({ enabled: true }).sort({ sortOrder: 1, createdAt: 1 }).lean(),
    getLimitState(userId),
  ]);
  return {
    ...limit,
    categories: SUPPORT_INTENT_CATEGORIES.filter((c) => intents.some((i) => i.category === c)),
    intents: intents.map((i) => ({
      key: i.key,
      category: i.category,
      question: i.question[lang] || i.question.en,
      needsOrder: i.needsOrder,
      helpfulCount: i.helpfulCount,
    })),
  };
}

/** The customer's recent orders in a category, newest first, for the "change order" picker. */
export async function listOrders(userId: string, category?: string) {
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).limit(40).select("status serviceType vendor packageDelivery createdAt totalPrice").lean();
  const categories = await orderCategories(orders);
  return orders
    .map((o: any) => ({
      id: String(o._id),
      category: categories.get(String(o._id)) as OrderCategory,
      status: o.status,
      stage: normalizeStatus(o.status),
      totalPrice: o.totalPrice,
      createdAt: o.createdAt,
    }))
    .filter((o) => !category || o.category === category)
    .slice(0, 10);
}

// Questions about a cancelled order or its money look at the latest such order; the rest look
// at whatever is still active, then the latest.
const PREFERS_CANCELLED = new Set(["whyCancelled", "refundStatus"]);

async function pickOrder(userId: string, intent: ISupportIntent): Promise<string | null> {
  const orders = await listOrders(userId, (ORDER_CATEGORIES as readonly string[]).includes(intent.category) ? intent.category : undefined);
  if (!orders.length) return null;
  const done = (s: string) => s === "delivered" || s === "cancelled";
  const preferred = PREFERS_CANCELLED.has(intent.resolver)
    ? orders.find((o) => o.stage === "cancelled")
    : orders.find((o) => !done(o.stage));
  return (preferred || orders[0]).id;
}

export async function askBot(userId: string, input: { intentKey: string; orderId?: string; lang?: string }) {
  const limit = await getLimitState(userId);
  if (limit.limitReached) throw new AppError(409, "BOT_LIMIT_REACHED");

  const intent = await SupportIntent.findOne({ key: input.intentKey, enabled: true });
  if (!intent) throw new NotFoundError("Question not found");
  const lang = normalizeLang(input.lang);

  let orderId: string | null = null;
  if (intent.needsOrder) {
    if (input.orderId) {
      const owned = await Order.exists({ _id: input.orderId, user: userId });
      if (!owned) throw new NotFoundError("Order not found");
      orderId = input.orderId;
    } else {
      orderId = await pickOrder(userId, intent);
    }
  }

  const query = await SupportBotQuery.create({
    user: userId,
    intent: intent._id,
    intentKey: intent.key,
    question: intent.question[lang] || intent.question.en,
    order: orderId,
    lang,
  });
  await SupportBotQueue.getInstance().enqueue(String(query._id));
  return { queryId: String(query._id), orderId };
}

export async function getQuery(userId: string, queryId: string) {
  const query = await SupportBotQuery.findOne({ _id: queryId, user: userId }).lean();
  if (!query) throw new NotFoundError("Query not found");
  return {
    queryId: String(query._id),
    status: query.status,
    answer: query.answer,
    question: query.question,
    orderId: query.order || null,
    helpful: query.helpful,
    ticketId: query.ticket ? String(query.ticket) : null,
  };
}

export async function giveFeedback(userId: string, queryId: string, helpful: boolean) {
  // helpful: null is matched only once, so a double tap or replay can't count twice.
  const query = await SupportBotQuery.findOneAndUpdate(
    { _id: queryId, user: userId, status: { $ne: "queued" }, helpful: null },
    { $set: { helpful } },
    { new: true }
  );
  if (!query) throw new AppError(409, "Feedback already given or answer not ready");
  await SupportIntent.updateOne({ _id: query.intent }, { $inc: helpful ? { helpfulCount: 1 } : { notHelpfulCount: 1 } });
  return getLimitState(userId);
}

function ticketCategory(resolver: string, category: string): string {
  if (category === "payment" || ["refundStatus", "fareBreakdown"].includes(resolver)) return "BILLING ADJUSTMENT";
  if (["orderStatus", "driverAssignment", "scheduledDelivery"].includes(resolver)) return "DELAYED DELIVERY";
  return "OPERATIONAL ISSUE";
}

export async function escalate(userId: string, role: string | undefined, queryId: string) {
  const query = await SupportBotQuery.findOne({ _id: queryId, user: userId });
  if (!query) throw new NotFoundError("Query not found");
  if (query.ticket) return { ticketId: String(query.ticket) };

  const owner = await resolveTicketOwner(userId, role);
  if (!owner) throw new NotFoundError("User not found");
  const intent = await SupportIntent.findById(query.intent).select("category resolver").lean();

  const notes = [`Asked the support bot: "${query.question}"`];
  if (query.answer) notes.push(`Bot answered: ${query.answer}`);
  if (query.helpful === false) notes.push("Customer marked the answer as not helpful.");

  const ticket = await createSupportTicket({
    owner,
    title: query.question || "Support bot question",
    category: ticketCategory(intent?.resolver || "", intent?.category || "general"),
    message: query.order ? `${query.question} (order ${query.order})` : query.question,
    systemNotes: notes,
    orderId: query.order,
    botQuery: query._id,
  });
  query.ticket = ticket._id as any;
  await query.save();
  return { ticketId: String(ticket._id) };
}
