import mongoose from "mongoose";
import Coupon, { ICoupon } from "../../database/models/Coupon";
import { NotFoundError, ValidationError } from "../../utils/errors";

export interface ApplicableCoupon {
  code: string;
  title: string;
  description: string;
  discountAmount: number;
  minOrder: number;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  maxDiscount?: number;
  isApplicable: boolean;
  amountToUnlock: number;
}

export class CouponsService {
  /**
   * The single place coupon money is calculated. Every caller — the listing, the validate
   * endpoint and order creation — goes through here so the three can never disagree.
   */
  computeDiscount(coupon: ICoupon, subtotal: number): number {
    const cartTotal = Number(subtotal) || 0;
    let discount = 0;

    if (coupon.discountType === "PERCENTAGE") {
      discount = (cartTotal * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, Number(coupon.maxDiscount));
      }
    } else {
      discount = Number(coupon.discountValue);
    }

    // A discount can never exceed the cart it is applied to.
    discount = Math.min(discount, cartTotal);
    return Math.max(0, Math.round(discount));
  }

  private buildTitle(coupon: ICoupon): string {
    if (coupon.title) return coupon.title;
    if (coupon.discountType === "PERCENTAGE") {
      return coupon.maxDiscount
        ? `${coupon.discountValue}% off up to ₹${coupon.maxDiscount}`
        : `${coupon.discountValue}% off`;
    }
    return `₹${coupon.discountValue} off`;
  }

  private buildDescription(coupon: ICoupon): string {
    if (coupon.description) return coupon.description;
    const minOrder = Number(coupon.minOrderValue) || 0;
    return minOrder > 0 ? `Min order ₹${minOrder}` : "No minimum order";
  }

  /**
   * Live = active, not expired, and either platform-wide or owned by this outlet.
   * Built with an explicit $and because two `$or` keys in one object literal overwrite
   * each other.
   */
  private buildLiveFilter(vendorId?: string) {
    const scopeClauses: any[] = [{ vendor: null }];
    if (vendorId && mongoose.Types.ObjectId.isValid(vendorId)) {
      scopeClauses.push({ vendor: new mongoose.Types.ObjectId(vendorId) });
    }

    return {
      $and: [
        { isActive: true },
        { $or: [{ expiryDate: null }, { expiryDate: { $gt: new Date() } }] },
        { $or: scopeClauses },
      ],
    };
  }

  async listApplicable(subtotal: number, vendorId?: string): Promise<ApplicableCoupon[]> {
    const cartTotal = Number(subtotal) || 0;
    const coupons = await Coupon.find(this.buildLiveFilter(vendorId) as any).sort({ createdAt: -1 });

    return coupons
      .map((coupon) => {
        const minOrder = Number(coupon.minOrderValue) || 0;
        const isApplicable = cartTotal >= minOrder;
        return {
          code: coupon.code,
          title: this.buildTitle(coupon),
          description: this.buildDescription(coupon),
          discountAmount: isApplicable ? this.computeDiscount(coupon, cartTotal) : 0,
          minOrder,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          maxDiscount: coupon.maxDiscount,
          isApplicable,
          amountToUnlock: Math.max(0, minOrder - cartTotal),
        };
      })
      .sort((a, b) => Number(b.isApplicable) - Number(a.isApplicable) || b.discountAmount - a.discountAmount);
  }

  /**
   * Resolves a typed code against a cart. Throws with the exact message the apps already
   * render; returns the server-computed discount, which is the only number order creation
   * is allowed to trust.
   */
  async resolveForCart(code: string, subtotal: number, vendorId?: string): Promise<{ coupon: ICoupon; discountAmount: number }> {
    if (!code) {
      throw new ValidationError("Promo code is required");
    }

    const coupon = await Coupon.findOne({ code: String(code).toUpperCase() });
    if (!coupon) {
      throw new NotFoundError("Invalid promo code");
    }

    if (!coupon.isActive) {
      throw new ValidationError("This promo code is no longer active");
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      throw new ValidationError("This promo code has expired");
    }

    if (coupon.vendor && coupon.vendor.toString() !== String(vendorId || "")) {
      throw new ValidationError("This promo code isn't valid for this restaurant");
    }

    const cartTotal = Number(subtotal) || 0;
    if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
      throw new ValidationError(`This promo code requires a minimum order of ₹${coupon.minOrderValue}`);
    }

    return { coupon, discountAmount: this.computeDiscount(coupon, cartTotal) };
  }

  async recordUsage(couponId: mongoose.Types.ObjectId | string): Promise<void> {
    await Coupon.updateOne({ _id: couponId }, { $inc: { usageCount: 1 } });
  }
}
