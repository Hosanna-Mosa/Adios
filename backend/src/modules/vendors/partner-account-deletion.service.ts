import Vendor from "../../database/models/Vendor";
import MeatCenter from "../../database/models/MeatCenter";
import Order, { OrderStatus } from "../../database/models/Order";
import FoodItem from "../../database/models/FoodItem";
import MeatItem from "../../database/models/MeatItem";
import ScheduledDeliveryRequest from "../../database/models/ScheduledDeliveryRequest";
import VendorPayout, { MIN_VENDOR_PAYOUT_AMOUNT, VendorPayoutStatus } from "../../database/models/VendorPayout";
import { AccountDeletionBlockedError, destroyImages } from "../users/account-deletion.service";
import { NotFoundError } from "../../utils/errors";
import { getVendorPayoutBalance } from "./vendors.controller";

/**
 * Self-service account deletion for restaurant and meat-centre partners (Google
 * Play requires one, in the Partner app and on the web). The partner twin of
 * users/account-deletion.service.
 *
 * The outlet is anonymised rather than erased: past orders' invoices print the
 * outlet's name, address, GSTIN and FSSAI number, so those stay. Everything
 * that identifies the owner — contact details, credentials, KYC, PAN, bank
 * account, signature, document files, push endpoints — is removed, the menu is
 * deleted, the outlet stops taking orders and drops out of every customer
 * listing, and every session ends (authenticateToken rejects a deleted outlet).
 */

// Same set the customer/driver deletion treats as finished.
const FINISHED_ORDER_STATUSES: string[] = [
  OrderStatus.COMPLETED,
  OrderStatus.DELIVERED,
  OrderStatus.DELIVERED_LC,
  OrderStatus.CANCELLED,
  "completed",
  "cancelled",
];

const PARTNER_ROLES = ["restaurant_vendor", "meat_vendor"];

/** A Vendor first; a meat vendor may instead be a legacy MeatCenter (as at sign-in). */
async function findOutlet(id: string, role: string) {
  const vendor = await Vendor.findById(id);
  if (vendor) return { kind: "vendor" as const, vendor };
  const center = role === "meat_vendor" ? await MeatCenter.findById(id) : null;
  return center ? { kind: "meat_center" as const, center } : null;
}

/**
 * Anonymises the signed-in partner's outlet. `password` is the current sign-in
 * password — a stolen session or an unlocked phone must not be enough.
 */
export async function deleteOwnPartnerAccount(outletId: string, role: string, password: string | undefined) {
  if (!PARTNER_ROLES.includes(role)) throw new NotFoundError("Outlet not found");
  const outlet = await findOutlet(outletId, role);
  const doc = outlet?.kind === "vendor" ? outlet.vendor : outlet?.center;
  if (!outlet || !doc || doc.deletedAt) throw new NotFoundError("Outlet not found");

  if (!password || !doc.password || !(await doc.matchPassword(password))) {
    // 403, not 401: the apps sign the partner out on any 401.
    throw new AccountDeletionBlockedError("PASSWORD_INCORRECT", "Current password is incorrect", 403);
  }

  const id = doc._id;

  const activeOrder = await Order.exists({ vendor: id, status: { $nin: FINISHED_ORDER_STATUSES } } as any);
  if (activeOrder) {
    throw new AccountDeletionBlockedError(
      "ACTIVE_ORDER",
      "An order is still in progress. Delete your account once it is delivered or cancelled."
    );
  }

  // A customer is waiting on an answer, or on a delivery the outlet agreed to.
  const openScheduled = await ScheduledDeliveryRequest.exists({
    vendor: id,
    $or: [{ status: "pending" }, { status: "accepted", scheduledFor: { $gt: new Date() } }],
  });
  if (openScheduled) {
    throw new AccountDeletionBlockedError(
      "SCHEDULED_PENDING",
      "You have scheduled orders that are still open. Respond to them, or wait until they are delivered, then try again."
    );
  }

  if (outlet.kind === "vendor") {
    const pendingPayout = await VendorPayout.exists({
      vendor: id,
      status: { $in: [VendorPayoutStatus.PENDING, VendorPayoutStatus.PROCESSING] },
    });
    if (pendingPayout) {
      throw new AccountDeletionBlockedError(
        "PAYOUT_PENDING",
        "A payout to your bank account is still being processed. Try again once it has completed."
      );
    }
    // The bank details go with the account, so money the partner can still
    // withdraw has to leave first. Less than a payout's minimum can't be withdrawn.
    const { availableBalance } = await getVendorPayoutBalance(id, outlet.vendor.commissionRate);
    if (availableBalance >= MIN_VENDOR_PAYOUT_AMOUNT) {
      throw new AccountDeletionBlockedError(
        "BALANCE_REMAINING",
        "You still have earnings to withdraw. Request a payout from the Payouts screen first, then delete your account."
      );
    }
  }

  // The outlet stays (invoices), closed and out of every listing.
  const closed = {
    phone: `deleted-${id}`,
    isManuallyClosed: true,
    isOpen: false,
    expoPushTokens: [],
    deletedAt: new Date(),
  };

  const images: unknown[] = [doc.image];

  if (outlet.kind === "vendor") {
    const { vendor } = outlet;
    images.push(
      vendor.legal?.panFileName,
      vendor.legal?.gstFileName,
      vendor.legal?.fssaiFileName,
      vendor.legal?.chequeFileName
    );
    await Vendor.updateOne(
      { _id: id },
      {
        $set: { ...closed, webPushSubscriptions: [] },
        $unset: {
          email: 1,
          password: 1,
          googlePlaceId: 1,
          image: 1,
          owner: 1,
          kyc: 1,
          contract: 1,
          verificationReview: 1,
          currentLocation: 1,
          "legal.panNumber": 1,
          "legal.panVerified": 1,
          "legal.panFileName": 1,
          "legal.gstFileName": 1,
          "legal.fssaiFileName": 1,
          "legal.bankAccount": 1,
          "legal.accountType": 1,
          "legal.ifsc": 1,
          "legal.ifscVerified": 1,
          "legal.chequeFileName": 1,
          "operations.menuReferenceFileName": 1,
          "operations.menuUploadRows": 1,
          "operations.menuCategories": 1,
        },
      }
    );
    const items = await FoodItem.find({ vendorId: id }).select("images").lean();
    items.forEach((item) => images.push(...(item.images || [])));
    await FoodItem.deleteMany({ vendorId: id });
  } else {
    await MeatCenter.updateOne(
      { _id: id },
      {
        // Required and unique, so it can't be removed — and the real address is
        // released for a fresh sign-up. updateOne skips the required check on password.
        $set: { ...closed, email: `deleted-${id}@deleted.invalid` },
        $unset: { password: 1, image: 1, currentLocation: 1 },
      }
    );
  }

  // Meat items hang off the outlet id whichever collection holds it.
  const meatItems = await MeatItem.find({ meatCenterId: id }).select("image").lean();
  meatItems.forEach((item) => images.push(item.image));
  await MeatItem.deleteMany({ meatCenterId: id });

  await destroyImages(images);

  return { success: true };
}

/**
 * The outlet a Partner app sign-in identifier names: a Vendor first, then a legacy
 * MeatCenter — the order /vendors/login and /meat/login are tried in. Used by the
 * web deletion request (auth.service deleteAccountWithPassword).
 */
export async function findPartnerBySignIn(phoneOrEmail: string) {
  const value = phoneOrEmail.trim();
  const query = value.includes("@") ? { email: value.toLowerCase() } : { phone: value.replace(/\D/g, "") };
  const vendor = await Vendor.findOne(query);
  if (vendor) return { outlet: vendor, role: vendor.partnerType === "meat" ? "meat_vendor" : "restaurant_vendor" };
  const center = await MeatCenter.findOne(query);
  return center ? { outlet: center, role: "meat_vendor" } : null;
}
