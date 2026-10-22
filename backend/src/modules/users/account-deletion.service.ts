import { gzipSync } from "zlib";
import User, { UserRole } from "../../database/models/User";
import Order, { OrderStatus } from "../../database/models/Order";
import Payment from "../../database/models/Payment";
import Review from "../../database/models/Review";
import SupportTicket from "../../database/models/SupportTicket";
import ChatMessage from "../../database/models/ChatMessage";
import SupportBotQuery from "../../database/models/SupportBotQuery";
import Notification from "../../database/models/Notification";
import Cart from "../../database/models/Cart";
import ScheduledDeliveryRequest from "../../database/models/ScheduledDeliveryRequest";
import DeletedAccountArchive from "../../database/models/DeletedAccountArchive";
import { AppError, ForbiddenError, NotFoundError } from "../../utils/errors";

const FINISHED_STATUSES: string[] = [
  OrderStatus.COMPLETED,
  OrderStatus.DELIVERED,
  OrderStatus.DELIVERED_LC,
  OrderStatus.CANCELLED,
];

// An order nobody has touched for a day (an abandoned online-payment checkout,
// say) is not "in progress" and must not trap the customer in their account.
const STALE_ORDER_MS = 24 * 60 * 60 * 1000;

export const ACTIVE_ORDER_MESSAGE =
  "You have an order in progress. Please wait for it to finish or cancel it before deleting your account.";

/**
 * Deletes a customer account (DELETE /users/me).
 *
 * 1. Writes a complete safety copy to DeletedAccountArchive. Nothing is changed
 *    unless that write succeeds.
 * 2. Anonymises the User row in place rather than removing it: orders, payments
 *    and reviews keep pointing at it, so admin screens, driver earnings and
 *    vendor payouts carry on working. The phone number is released so it can
 *    be used for a new account.
 * 3. Bumps tokenVersion, which ends every session on every device.
 * 4. Removes data that only served the live account: cart and notifications.
 */
export async function deleteCustomerAccount(userId: string, password: string | undefined, reason?: string) {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found");
  if (user.role !== UserRole.USER) {
    throw new ForbiddenError("Only customer accounts can be deleted from the app. Please contact support.");
  }

  // Accounts created before passwords were required have none to check.
  if (user.password) {
    if (!password || !(await user.matchPassword(password))) {
      // 400, not 401: the app's HTTP layer signs the user out on any 401.
      throw new AppError(400, "Incorrect password");
    }
  }

  const now = Date.now();
  const activeOrder = await Order.exists({
    user: user._id,
    status: { $nin: FINISHED_STATUSES },
    $or: [{ updatedAt: { $gt: new Date(now - STALE_ORDER_MS) } }, { scheduledFor: { $gt: new Date(now) } }],
  });
  if (activeOrder) throw new AppError(409, ACTIVE_ORDER_MESSAGE);

  const [orders, payments, reviews, supportTickets, chatMessages, supportBotQueries, notifications, cart, scheduledDeliveryRequests] =
    await Promise.all([
      Order.find({ user: user._id }).lean(),
      Payment.find({ user: user._id }).lean(),
      Review.find({ user: user._id }).lean(),
      SupportTicket.find({ userId: user._id }).lean(),
      ChatMessage.find({ senderId: String(user._id) }).lean(),
      SupportBotQuery.find({ user: user._id }).lean(),
      Notification.find({ user: user._id }).lean(),
      Cart.findOne({ user: user._id }).lean(),
      ScheduledDeliveryRequest.find({ customer: user._id }).lean(),
    ]);

  const related = { orders, payments, reviews, supportTickets, chatMessages, supportBotQueries, notifications, scheduledDeliveryRequests };
  const counts: Record<string, number> = Object.fromEntries(Object.entries(related).map(([key, rows]) => [key, rows.length]));
  counts.cart = cart ? 1 : 0;

  // toObject without the toJSON transform, so the copy is complete (password hash included).
  const snapshot = { archivedAt: new Date(now).toISOString(), user: user.toObject(), ...related, cart };

  await DeletedAccountArchive.create({
    originalUserId: user._id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    reason: reason?.trim() || undefined,
    deletedAt: new Date(now),
    counts,
    snapshot: gzipSync(Buffer.from(JSON.stringify(snapshot))),
  });

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        name: "Deleted user",
        phone: `deleted_${user._id}`,
        isBlocked: true,
        deletedAt: new Date(now),
        addresses: [],
        favorites: [],
        favoriteItems: [],
        webPushSubscriptions: [],
      },
      $unset: {
        email: "",
        username: "",
        profilePic: "",
        password: "",
        expoPushToken: "",
        bookingPreference: "",
        defaultLocation: "",
      },
      $inc: { tokenVersion: 1 },
    }
  );

  await Promise.all([Cart.deleteOne({ user: user._id }), Notification.deleteMany({ user: user._id })]);

  return { success: true };
}
