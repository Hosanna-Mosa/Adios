import { Response } from "express";
import type { AuthRequest } from "../../middleware/auth.middleware";
import Coupon from "../../database/models/Coupon";

// A partner's own offers: coupons scoped to their outlet (Coupon.vendor). The customer app already
// lists them with the platform's coupons whenever the cart is from that outlet, and the discount is
// worked out by CouponsService like any other coupon — so this only creates and manages them.
// Limits keep an offer from giving the order away; the admin's platform-wide coupons are untouched.

const VENDOR_ROLES = ["restaurant_vendor", "meat_vendor"];
export const MAX_ACTIVE_OFFERS = 10;
export const MAX_PERCENT = 50;
export const MAX_FLAT = 500;

const partnerId = (req: AuthRequest) => {
  const id = req.user?.userId;
  return id && VENDOR_ROLES.includes(String(req.user?.role)) ? String(id) : null;
};

export interface OfferInput {
  code: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  maxDiscount?: number;
  minOrderValue?: number;
  expiryDate?: string;
  title?: string;
}

/** Why an offer is not allowed, or null when it is fine. Pure, so the rules are tested. */
export function offerProblem(input: OfferInput, now: Date = new Date()): string | null {
  if (input.discountType === "PERCENTAGE" && (input.discountValue < 1 || input.discountValue > MAX_PERCENT)) {
    return `A percentage offer must be between 1% and ${MAX_PERCENT}%.`;
  }
  if (input.discountType === "FLAT" && (input.discountValue < 1 || input.discountValue > MAX_FLAT)) {
    return `A flat offer must be between ₹1 and ₹${MAX_FLAT}.`;
  }
  if (input.discountType === "FLAT" && input.minOrderValue != null && input.minOrderValue < input.discountValue) {
    return "The minimum order must be at least the discount.";
  }
  if (input.expiryDate) {
    const expiry = new Date(input.expiryDate);
    if (Number.isNaN(expiry.getTime()) || expiry.getTime() <= now.getTime()) return "The expiry date must be in the future.";
  }
  return null;
}

/** GET /vendors/me/offers */
export const listMyOffers = async (req: AuthRequest, res: Response) => {
  try {
    const id = partnerId(req);
    if (!id) return res.status(403).json({ message: "Only partner accounts have offers" });
    return res.json(await Coupon.find({ vendor: id }).sort({ createdAt: -1 }).lean());
  } catch (error) {
    console.error("Error listing partner offers:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/** POST /vendors/me/offers */
export const createMyOffer = async (req: AuthRequest, res: Response) => {
  try {
    const id = partnerId(req);
    if (!id) return res.status(403).json({ message: "Only partner accounts can create offers" });

    const input = req.body as OfferInput;
    const problem = offerProblem(input);
    if (problem) return res.status(400).json({ message: problem });

    const active = await Coupon.countDocuments({ vendor: id, isActive: true });
    if (active >= MAX_ACTIVE_OFFERS) {
      return res.status(409).json({ message: `You can have at most ${MAX_ACTIVE_OFFERS} active offers. Turn one off first.` });
    }
    const code = input.code.trim().toUpperCase();
    if (await Coupon.exists({ code })) return res.status(409).json({ message: "That code is already in use. Choose another." });

    const offer = await Coupon.create({
      code,
      discountType: input.discountType,
      discountValue: input.discountValue,
      maxDiscount: input.discountType === "PERCENTAGE" ? input.maxDiscount || undefined : undefined,
      minOrderValue: input.minOrderValue ?? 0,
      expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
      title: input.title || undefined,
      isActive: true,
      vendor: id,
    });
    return res.status(201).json(offer);
  } catch (error) {
    console.error("Error creating partner offer:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/** PUT /vendors/me/offers/:id/active — turn an offer on or off. */
export const setMyOfferActive = async (req: AuthRequest, res: Response) => {
  try {
    const id = partnerId(req);
    if (!id) return res.status(403).json({ message: "Only partner accounts can change offers" });
    const { isActive } = req.body as { isActive: boolean };

    const offer = await Coupon.findOne({ _id: req.params.id, vendor: id });
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    if (isActive && offer.expiryDate && offer.expiryDate.getTime() <= Date.now()) {
      return res.status(409).json({ message: "This offer has expired. Create a new one." });
    }
    if (isActive && !offer.isActive && (await Coupon.countDocuments({ vendor: id, isActive: true })) >= MAX_ACTIVE_OFFERS) {
      return res.status(409).json({ message: `You can have at most ${MAX_ACTIVE_OFFERS} active offers. Turn one off first.` });
    }
    offer.isActive = isActive;
    await offer.save();
    return res.json(offer);
  } catch (error) {
    console.error("Error updating partner offer:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/** DELETE /vendors/me/offers/:id */
export const deleteMyOffer = async (req: AuthRequest, res: Response) => {
  try {
    const id = partnerId(req);
    if (!id) return res.status(403).json({ message: "Only partner accounts can delete offers" });
    const deleted = await Coupon.findOneAndDelete({ _id: req.params.id, vendor: id });
    if (!deleted) return res.status(404).json({ message: "Offer not found" });
    return res.json({ message: "Offer deleted" });
  } catch (error) {
    console.error("Error deleting partner offer:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
