export interface Coupon {
  _id: string;
  code: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  maxDiscount?: number;
  minOrderValue?: number;
  expiryDate?: string;
  isActive: boolean;
  usageCount: number;
}

export interface NewCouponForm {
  code: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  maxDiscount: number;
  minOrderValue: number;
  expiryDate: string;
}
