import type { TFunction } from "i18next";
import type { FoodItem, FoodItemInput } from "@/types/models";
import { discountPercent, isBlank, parseNumber } from "@/utils/number";

// The dish form's rules — the same ones the backend applies to POST/PUT /food.

export type DishErrors = Partial<
  Record<"name" | "price" | "category" | "images" | "offerPrice" | "protein" | "calories" | "bestsellerMinOrders", string>
>;

export const EMPTY_DISH: FoodItemInput = {
  name: "",
  description: "",
  price: "",
  category: "",
  isVeg: true,
  images: [],
  offerPrice: "",
  protein: "",
  calories: "",
  promoteBestseller: false,
  bestsellerMinOrders: "",
};

const text = (n: number | null | undefined) => (n == null ? "" : String(n));

export const dishToInput = (item: FoodItem): FoodItemInput => ({
  name: item.name,
  description: item.description ?? "",
  price: String(item.price ?? ""),
  category: item.category ?? "",
  isVeg: item.isVeg,
  images: item.images ?? [],
  offerPrice: text(item.offerPrice),
  protein: text(item.protein),
  calories: text(item.calories),
  promoteBestseller: item.bestsellerMinOrders != null,
  bestsellerMinOrders: item.bestsellerMinOrders ? String(item.bestsellerMinOrders) : "",
});

/** The live "X% off" under the offer field — null while the offer isn't valid yet. */
export const formDiscount = (form: FoodItemInput) => discountPercent(parseNumber(form.price), parseNumber(form.offerPrice));

export function validateDish(form: FoodItemInput, isEdit: boolean, t: TFunction): DishErrors {
  const price = parseNumber(form.price);
  const priceOk = price != null && price > 0;
  const offer = parseNumber(form.offerPrice);
  const nonNegative = (value: string) => isBlank(value) || ((parseNumber(value) ?? -1) >= 0);
  const minOrders = parseNumber(form.bestsellerMinOrders);

  return {
    name: form.name.trim() ? undefined : t("dishForm.nameRequired"),
    price: priceOk ? undefined : t("dishForm.priceRequired"),
    // Required by the FoodItem model, and it is what groups the customer app's menu.
    category: form.category.trim() ? undefined : t("dishForm.categoryRequired"),
    // Same rule as the panel: a new dish needs at least one photo.
    images: isEdit || form.images.length ? undefined : t("dishForm.photoRequired"),
    offerPrice: isBlank(form.offerPrice)
      ? undefined
      : offer == null || offer <= 0
        ? t("dishForm.offerInvalid")
        : priceOk && offer >= price
          ? t("dishForm.offerTooHigh")
          : undefined,
    protein: nonNegative(form.protein) ? undefined : t("dishForm.nutritionInvalid"),
    calories: nonNegative(form.calories) ? undefined : t("dishForm.nutritionInvalid"),
    bestsellerMinOrders:
      !form.promoteBestseller || isBlank(form.bestsellerMinOrders) || (minOrders != null && minOrders >= 0 && Number.isInteger(minOrders))
        ? undefined
        : t("dishForm.bestsellerInvalid"),
  };
}

export const hasErrors = (errors: DishErrors) => Object.values(errors).some(Boolean);
