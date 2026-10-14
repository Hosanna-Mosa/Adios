import Order from "../../database/models/Order";
import Payment from "../../database/models/Payment";
import SupportBotQuery from "../../database/models/SupportBotQuery";
import SupportIntent from "../../database/models/SupportIntent";
import { SocketManager } from "../../sockets/socket.manager";
import { ANSWER_TEMPLATES, CATEGORY_LABELS, renderAnswer, type AnswerPart } from "./answers";
import { runResolver, type OrderSnapshot, type PaymentSnapshot } from "./resolvers";

// Builds one bot answer: loads the customer's data, runs the intent's resolver, stores the
// plain-text answer and tells the app. Kept free of queue/service imports so both the BullMQ
// worker and the Redis-down inline fallback can use it without a circular import.

export function snapshotOrder(order: any): OrderSnapshot {
  const driverUser = order.driver?.user;
  return {
    id: String(order._id),
    status: order.status,
    serviceType: order.serviceType,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    cancelReason: order.cancelReason,
    // undefined (not null) for non-restaurant orders, which is how the resolver tells them apart
    prepMinutes: order.dispatchMode ? order.prepMinutes ?? null : undefined,
    restaurantAcceptedAt: order.dispatchMode ? order.restaurantAcceptedAt ?? null : undefined,
    scheduledFor: order.scheduledFor,
    scheduleStatus: order.scheduleStatus,
    scheduleRejectionReason: order.scheduleRejectionReason,
    refundStatus: order.refundStatus,
    refundAmount: order.refundAmount,
    refundRequestedAt: order.refundRequestedAt,
    refundCompletedAt: order.refundCompletedAt,
    searchExhaustedAt: order.searchExhaustedAt,
    dispatch: order.dispatch
      ? {
          attempts: order.dispatch.attempts,
          startedAt: order.dispatch.startedAt,
          failureReason: order.dispatch.failureReason,
          state: order.dispatch.state,
        }
      : null,
    priceBreakdown: order.priceBreakdown,
    totalPrice: order.totalPrice,
    discountAmount: order.discountAmount,
    assignConfirmedAt: order.assignConfirmedAt,
    taskStartedAt: order.taskStartedAt,
    driverName: driverUser?.name || undefined,
    createdAt: order.createdAt,
    // restaurantPickupCode / deliveryOtp are deliberately not copied.
  };
}

export function snapshotPayment(p: any): PaymentSnapshot {
  return {
    status: p.status,
    purpose: p.purpose,
    amountPaise: p.amount,
    hasOrder: !!p.order || p.status === "captured",
    topupAmount: p.topupAmount,
    topupRefundStatus: p.topupRefundStatus,
    order: p.order ? String(p.order) : undefined,
    createdAt: p.createdAt,
  };
}

export async function processSupportBotQuery(queryId: string): Promise<void> {
  const query = await SupportBotQuery.findById(queryId);
  if (!query || query.status === "done") return;
  const lang = query.lang;

  try {
    const intent = await SupportIntent.findById(query.intent).lean();
    if (!intent) throw new Error("Intent not found");

    let order: OrderSnapshot | null = null;
    if (query.order) {
      const doc = await Order.findOne({ _id: query.order, user: query.user })
        .populate({ path: "driver", populate: { path: "user", select: "name" } })
        .lean();
      order = doc ? snapshotOrder(doc) : null;
    }
    const payments = await Payment.find({ user: query.user }).sort({ createdAt: -1 }).limit(20).lean();

    const staticText = intent.staticAnswer?.[lang] || intent.staticAnswer?.en || "";
    const parts: AnswerPart[] = query.order && !order
      ? [{ key: "orderMissing" }]
      : runResolver(intent.resolver, {
          order,
          payments: payments.map(snapshotPayment),
          staticAnswer: staticText,
          category: CATEGORY_LABELS[intent.category]?.[lang] ?? "",
          now: new Date(),
        });

    query.answer = renderAnswer(lang, parts);
    query.status = "done";
  } catch (err) {
    console.error("[SUPPORT BOT] Failed to build answer for query", queryId, err);
    query.answer = ANSWER_TEMPLATES.failed[lang];
    query.status = "failed";
  }

  await query.save();
  try {
    SocketManager.getInstance().emitToUser(
      String(query.user),
      "support_bot_answer",
      { queryId: String(query._id), status: query.status },
      "support-bot"
    );
  } catch {
    // The app polls GET /queries/:id as well, so a missed socket event is harmless.
  }
}
