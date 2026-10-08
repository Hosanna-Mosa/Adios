// Restaurant menu and meat inventory shapes — backend/src/modules/{food,meat}.

export interface FoodItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  images: string[];
  isAvailable?: boolean;
  /** Discounted price, below `price`. null/absent = no offer. */
  offerPrice?: number | null;
  /** Grams per serving. */
  protein?: number | null;
  /** kcal per serving. */
  calories?: number | null;
  /** The owner promotes it as a bestseller: 0 = badge right away, X = after X orders. null = not promoted. */
  bestsellerMinOrders?: number | null;
  // Computed by GET /food/vendor/:vendorId.
  /** Total quantity ordered across this outlet's non-cancelled orders. */
  orderCount?: number;
  isBestseller?: boolean;
  discountPercent?: number | null;
}

/** The dish form's fields — numbers stay strings while they're being typed. */
export interface FoodItemInput {
  name: string;
  description: string;
  price: string;
  category: string;
  isVeg: boolean;
  images: string[];
  /** Empty = no offer. */
  offerPrice: string;
  protein: string;
  calories: string;
  promoteBestseller: boolean;
  /** Empty or "0" = show the badge right away. */
  bestsellerMinOrders: string;
}

/** One row of POST /food/bulk. */
export interface BulkFoodItem {
  name: string;
  price: number;
  category: string;
  description?: string;
  offerPrice?: number | null;
  isVeg?: boolean;
  protein?: number | null;
  calories?: number | null;
}

export interface BulkUploadResult {
  created: number;
  /** `row` is the 1-based index in the items that were sent. */
  failed: { row: number; error: string }[];
}

export interface MeatItem {
  _id: string;
  name: string;
  weight: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  isGlobalItem?: boolean;
}
