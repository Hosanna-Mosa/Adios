export type OfferDiscountType = "PERCENTAGE" | "FLAT";

/** An admin-managed restaurant offer (GET /admin/offers — vendor populated with _id, name, image). */
export interface Offer {
  _id: string;
  title: string;
  description?: string;
  vendor: { _id: string; name: string; image?: string } | null;
  discountType: OfferDiscountType;
  discountValue: number;
  maxDiscount?: number;
  minOrderValue?: number;
  couponCode?: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
}

/** Form state — numbers are kept as strings so a field can be left blank. */
export interface OfferFormData {
  vendor: string;
  title: string;
  description: string;
  discountType: OfferDiscountType;
  discountValue: string;
  maxDiscount: string;
  minOrderValue: string;
  couponCode: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  displayOrder: string;
}

/** A restaurant the offer can be attached to (from GET /vendors/nearby?lat=0&lng=0). */
export interface OfferRestaurantOption {
  _id: string;
  name: string;
  address?: string;
}
