

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

export const HOME_SKELETON_ITEMS = Array.from({ length: 4 }, (_, index) => ({ _id: `home-skeleton-${index}` }));

export const DEFAULT_CUISINES = ["Biryani", "Tiffins", "Chinese", "Pizza", "Sweets"];

export const DEFAULT_MEAT_TYPES = ["Chicken", "Mutton", "Seafood", "Eggs"];

export const FOOD_PROMOS = [
  { eyebrow: "First order", headline: "50% off up to ₹120", caption: "Code FLAV50 · min ₹199" },
  { eyebrow: "Late night", headline: "Open till 2 AM", caption: "42 outlets near you" },
];

export const MEAT_PROMOS = [
  { eyebrow: "Sunday special", headline: "Country chicken ₹399 / kg", caption: "" },
  { eyebrow: "Cleaned & cut", headline: "No fee today", caption: "" },
];
