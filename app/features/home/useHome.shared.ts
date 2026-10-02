

// Module-level values shared by the parts of useHome.

export const TAG_SEARCH_MAP: { [key: string]: string } = {
  "Biryani": "Biryani",
  "Dosa": "Dosa",
  "Idly": "Idli",
  "Fried Rice": "Rice",
  "Fast Food": "Burger",
  "Breakfast": "Breakfast",
  "Healthy": "Salad",
  "Deals": "Thali",
  "Burgers": "Burger",
  "Smoothie": "Lassi",
  "Pizza": "Pizza",
  "Desserts": "Waffles",
  "Tea & Coffee": "Coffee",
  "Noodles": "Noodles",
  "Chicken": "Chicken",
  "Paneer": "Paneer",
  "Fish": "Fish",
};

// The startup ad is capped at one per calendar day — it used to reappear on
// every visit to the home screen, since the "already shown" flag was component
// state that reset with the screen.
export const STARTUP_AD_LAST_SHOWN_KEY = "startup_ad_last_shown";

/** Local calendar day as YYYY-MM-DD, built by hand so it never depends on Intl. */
export const startupAdDayKey = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

export const HOME_SKELETON_ITEMS = Array.from({ length: 4 }, (_, index) => ({ _id: `home-skeleton-${index}` }));

export const DEFAULT_CUISINES = ["Biryani", "Tiffins", "Chinese", "Pizza", "Sweets"];

export const DEFAULT_MEAT_TYPES = ["Chicken", "Mutton", "Seafood", "Eggs"];

// FOOD_PROMOS/MEAT_PROMOS moved into useHomeAvailableCuisines() as useMemo
// values so their copy can call t() — see
// ADIOS_MULTILINGUAL_DEVELOPMENT_PLAN.md, Section 11.

// TAG_SEARCH_MAP's keys and values are deliberately left untranslated: this
// map is only ever used internally to expand a search-chip tap into a
// broader query term sent to /food/search (see useHomePart5.tsx) — it is
// never rendered as visible text — and both sides are matched against real
// English dish/category names in the database, so translating them would
// silently break search instead of localizing anything a user sees.

// DEFAULT_CUISINES/DEFAULT_MEAT_TYPES below are also left untranslated for a
// related reason: they double as the fallback set of `cuisineChips`, whose
// SAME string values are later compared against live vendor category data
// when a customer filters by cuisine. Only the visible label is translated,
// via CuisineStrip.tsx's translateFoodTag() display wrapper — the
// underlying values that flow through app state/filtering stay in English.
