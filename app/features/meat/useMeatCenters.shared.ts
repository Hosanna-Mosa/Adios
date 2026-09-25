

// Module-level values shared by the parts of useMeatCenters.

// `name` stays in English: it's compared against `selectedCategory` and
// against meat centers' own category data. MeatTypeChip.tsx translates the
// displayed label via the shared translateFoodTag() helper instead of
// translating this array — see useHome.shared.ts for the same pattern
// applied to DEFAULT_CUISINES/DEFAULT_MEAT_TYPES.
export const MEAT_TYPES = [
  { name: "Chicken", emoji: "🐔" },
  { name: "Mutton", emoji: "🐐" },
  { name: "Fish", emoji: "🐟" },
  { name: "Prawns", emoji: "🦐" },
  { name: "Eggs", emoji: "🥚" },
];

export type QuickFilter = "fast" | "rating" | "open";
