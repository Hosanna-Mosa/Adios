

// Module-level values shared by the parts of useRestaurantMenu.

export interface FoodItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  images: string[];
  isAvailable?: boolean;
  /** Discounted price; only applies when a number above 0 and below `price`. */
  offerPrice?: number | null;
  /** Server-computed round((price - offerPrice) / price * 100). */
  discountPercent?: number | null;
  isBestseller?: boolean;
  orderCount?: number;
  /** Grams. */
  protein?: number | null;
  /** kcal. */
  calories?: number | null;
}
