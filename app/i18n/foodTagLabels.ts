import type { TFunction } from "i18next";

// Shared display-label translator for cuisine/meat-type words that double as
// data values compared against live backend content (vendor categories,
// search-synonym matching, selected-filter equality checks — see
// CUISINE_EMOJI/TAG_SEARCH_MAP/DEFAULT_CUISINES/DEFAULT_MEAT_TYPES/MEAT_TYPES
// in the constants inventory). Those underlying English values are never
// changed — only what's shown to the user goes through this. Unknown values
// (e.g. a cuisine tag that only exists in a vendor's own live data) fall back
// to the raw string unchanged, since there is no translation for text the
// backend itself hasn't been taught to localize yet (tracked separately as
// backend/DB localization work, out of scope for the client-only pass).
const FOOD_TAG_KEYS: Record<string, string> = {
  Biryani: "biryani",
  Dosa: "dosa",
  Idly: "idly",
  Idli: "idli",
  "Fried Rice": "friedRice",
  "Fast Food": "fastFood",
  Breakfast: "breakfast",
  Healthy: "healthy",
  Deals: "deals",
  Burgers: "burgers",
  Smoothie: "smoothie",
  Pizza: "pizza",
  Desserts: "desserts",
  "Tea & Coffee": "teaCoffee",
  Noodles: "noodles",
  Chicken: "chicken",
  Paneer: "paneer",
  Fish: "fish",
  Tiffins: "tiffins",
  Chinese: "chinese",
  Sweets: "sweets",
  "South Indian": "southIndian",
  "North Indian": "northIndian",
  Mughlai: "mughlai",
  Kebabs: "kebabs",
  Rolls: "rolls",
  Mutton: "mutton",
  Seafood: "seafood",
  Eggs: "eggs",
  Prawns: "prawns",
};

export function translateFoodTag(raw: string, t: TFunction): string {
  const key = FOOD_TAG_KEYS[raw];
  return key ? t(`app.foodTags.${key}`, raw) : raw;
}
