import { Response } from "express";
import type { AuthRequest } from "../../middleware/auth.middleware";
import Vendor from "../../database/models/Vendor";
import MeatCenter from "../../database/models/MeatCenter";
import VendorPayout, { MIN_VENDOR_PAYOUT_AMOUNT, VendorPayoutStatus } from "../../database/models/VendorPayout";
import { getVendorPayoutBalance } from "./vendors.controller";

const VENDOR_ROLES = ["restaurant_vendor", "meat_vendor"];
const HISTORY_LIMIT = 50;

/**
 * GET /api/v1/vendors/me/payouts — the partner app's Payouts screen: what the
 * outlet can withdraw (the same figure POST /vendors/payout checks against),
 * the bank account it is paid to, and its recent payouts.
 *
 * The account number is masked to its last four digits — the full number never
 * leaves the server. A failed payout carries its reason only when a person wrote
 * it (an admin rejecting it); a RazorpayX error message is for the admin panel.
 */
export const getMyPayouts = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.user?.userId;
    const role = String(req.user?.role || "");
    if (!id || !VENDOR_ROLES.includes(role)) {
      return res.status(403).json({ message: "Only partner accounts have payouts" });
    }

    const vendor = await Vendor.findById(id)
      .select("commissionRate legal.bankAccount legal.ifsc legal.ifscVerified legal.accountType")
      .lean();
    if (!vendor) {
      // Legacy meat centres (MeatCenter) aren't on VendorPayout — the Flavour team settles them.
      if (role === "meat_vendor" && (await MeatCenter.exists({ _id: id }))) {
        return res.json({ payoutsEnabled: false });
      }
      return res.status(404).json({ message: "Outlet not found" });
    }

    const [balance, payouts] = await Promise.all([
      getVendorPayoutBalance(vendor._id, vendor.commissionRate),
      VendorPayout.find({ vendor: vendor._id })
        .sort({ createdAt: -1 })
        .limit(HISTORY_LIMIT)
        .select("amount status createdAt processedAt utr failureReason method")
        .lean(),
    ]);

    const account = vendor.legal?.bankAccount?.replace(/\s/g, "");
    return res.json({
      payoutsEnabled: true,
      minimumAmount: MIN_VENDOR_PAYOUT_AMOUNT,
      commissionRate: balance.commissionRate,
      balance: {
        earnedShare: balance.earnedShare,
        paidOut: balance.paidOut,
        availableBalance: balance.availableBalance,
      },
      bankAccount:
        account && vendor.legal?.ifsc
          ? {
              accountLast4: account.slice(-4),
              ifsc: vendor.legal.ifsc,
              accountType: vendor.legal.accountType ?? "savings",
              verified: vendor.legal.ifscVerified === true,
            }
          : null,
      payouts: payouts.map((payout) => ({
        _id: payout._id.toString(),
        amount: payout.amount,
        status: payout.status,
        requestedAt: payout.createdAt,
        paidAt: payout.processedAt,
        reference: payout.utr,
        note:
          payout.status === VendorPayoutStatus.FAILED && payout.method === "manual" ? payout.failureReason : undefined,
      })),
    });
  } catch (error) {
    console.error("Error fetching vendor payouts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
