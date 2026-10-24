import User, { UserRole } from "../../database/models/User";
import Driver, { DriverStatus } from "../../database/models/Driver";
import Order, { OrderStatus } from "../../database/models/Order";
import Cart from "../../database/models/Cart";
import DriverPayout, { DriverPayoutStatus } from "../../database/models/DriverPayout";
import cloudinary from "../../utils/cloudinary";
import { AppError, ForbiddenError, NotFoundError } from "../../utils/errors";

/**
 * Self-service account deletion for customers and drivers (Google Play requires
 * one, in the app and on the web).
 *
 * The account is anonymised rather than erased: orders, invoices, payments,
 * payouts and earnings must be kept for tax and accounting, and they stay — but
 * every field that identifies the person is cleared, every session ends, and
 * the phone number and email are released so they can sign up again.
 */

// Orders in any other status are still running for one of the parties.
const FINISHED_ORDER_STATUSES: string[] = [
  OrderStatus.COMPLETED,
  OrderStatus.DELIVERED,
  OrderStatus.DELIVERED_LC,
  OrderStatus.CANCELLED,
  "completed",
  "cancelled",
];

export const DELETED_USER_NAME = "Deleted user";

/** Why an account can't be deleted yet; the apps branch on `code`. */
export class AccountDeletionBlockedError extends AppError {
  constructor(public readonly code: string, message: string, statusCode = 409) {
    super(statusCode, message);
  }
}

/**
 * Best effort: an uploaded image's public id from its Cloudinary URL, or null.
 * The path after /upload/ is [transformations/][v<version>/]<public id>.<ext>.
 * Stored URLs are upload secure_urls, which always carry the version segment;
 * without one, only comma-joined transformation segments ("c_fill,w_200") are
 * skipped, so a folder named like "kyc_docs" is never mistaken for one.
 */
export function cloudinaryPublicId(url: unknown): string | null {
  const match = String(url ?? "").match(/^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(.+)$/i);
  if (!match) return null;
  const segments = match[1].split("?")[0].split("/");
  const version = segments.findIndex((segment) => /^v\d+$/.test(segment));
  const idSegments = version >= 0 ? segments.slice(version + 1) : segments.filter((segment) => !segment.includes(","));
  const id = idSegments.join("/").replace(/\.[a-z0-9]+$/i, "");
  return id || null;
}

export async function destroyImages(urls: unknown[]) {
  const ids = urls.map(cloudinaryPublicId).filter((id): id is string => !!id);
  await Promise.all(
    ids.map((id) =>
      cloudinary.uploader.destroy(id).catch((err: any) => {
        // Not fatal: the record no longer points at the image either way.
        console.warn(`[account-deletion] Could not delete image ${id}:`, err?.message || err);
      })
    )
  );
}

/**
 * Anonymises the account. `password` is the account's current password — a
 * stolen session or an unlocked phone must not be enough to wipe an account.
 */
export async function deleteOwnAccount(userId: string, password: string | undefined) {
  const user = await User.findById(userId);
  if (!user || user.deletedAt) throw new NotFoundError("Account not found");

  if (user.role !== UserRole.USER && user.role !== UserRole.DRIVER) {
    throw new ForbiddenError("Staff accounts are removed by an administrator.");
  }

  if (user.password) {
    if (!password || !(await user.matchPassword(password))) {
      // 403, not 401: the apps sign the user out on any 401.
      throw new AccountDeletionBlockedError("PASSWORD_INCORRECT", "Current password is incorrect", 403);
    }
  }

  const driver = user.role === UserRole.DRIVER ? await Driver.findOne({ user: user._id }) : null;

  const activeOrder = await Order.exists({
    status: { $nin: FINISHED_ORDER_STATUSES },
    $or: [{ user: user._id }, ...(driver ? [{ driver: driver._id }] : [])],
  } as any);
  if (activeOrder) {
    throw new AccountDeletionBlockedError(
      "ACTIVE_ORDER",
      "You have an order in progress. Delete your account once it is completed or cancelled."
    );
  }

  if (driver) {
    const pendingPayout = await DriverPayout.exists({
      driver: driver._id,
      status: { $in: [DriverPayoutStatus.PENDING, DriverPayoutStatus.PROCESSING] },
    });
    if (pendingPayout) {
      throw new AccountDeletionBlockedError(
        "PAYOUT_PENDING",
        "A payout to your bank account is still being processed. Try again once it has completed."
      );
    }
  }

  const images: unknown[] = [user.profilePic];

  if (driver) {
    images.push(driver.panImage, driver.dlFrontImage, driver.dlBackImage, driver.selfieImage);
    await Driver.updateOne(
      { _id: driver._id },
      {
        $set: { status: DriverStatus.OFFLINE, isAvailable: false, bankAccounts: [] },
        $unset: {
          gender: 1,
          currentLocation: 1,
          aadhaarNumber: 1,
          panNumber: 1,
          panImage: 1,
          digilockerId: 1,
          dlNumber: 1,
          dlExpiry: 1,
          dlVehicleClass: 1,
          dlFrontImage: 1,
          dlBackImage: 1,
          bankAccountNumber: 1,
          bankIfsc: 1,
          selfieImage: 1,
        },
      }
    );
  }

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        name: DELETED_USER_NAME,
        // Required and unique, so it can't be blank — and the real number is
        // released for a fresh sign-up.
        phone: `deleted-${user._id}`,
        addresses: [],
        favorites: [],
        favoriteItems: [],
        webPushSubscriptions: [],
        // Ends every session this account holds (see authenticateToken).
        tokenVersion: (user.tokenVersion ?? 0) + 1,
        isBlocked: true,
        deletedAt: new Date(),
      },
      $unset: {
        email: 1,
        username: 1,
        password: 1,
        profilePic: 1,
        defaultLocation: 1,
        bookingPreference: 1,
        expoPushToken: 1,
      },
    }
  );

  await Cart.deleteOne({ user: user._id }).catch(() => {});
  await destroyImages(images);

  return { success: true };
}
