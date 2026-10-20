// Matching and ranking for GET /food/search (dish + restaurant search).
//
// A dish matches only when EVERY word the customer typed is found at the start
// of a word somewhere in the dish (name, category, description) or its
// restaurant (name, cuisines). So "chicken biryani" no longer returns every
// chicken dish and every biryani, "tea" no longer matches "steak", and
// "bawarchi biryani" finds the biryanis at Bawarchi.

/** Letters (with combining marks, for Telugu/Hindi) and digits make up a word. */
const WORD_CHAR = /[\p{L}\p{M}\p{N}]/u;

export const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** "Chicken, Biryani!" -> ["chicken", "biryani"]. At most 6 words. */
export const toSearchTokens = (term: string) =>
  term
    .toLowerCase()
    .split(/[^\p{L}\p{M}\p{N}]+/u)
    .filter(Boolean)
    .slice(0, 6);

/** True when `token` starts a word in `value` ("bir" in "Chicken Biryani", not "tea" in "steak"). */
export const hasWordStartingWith = (value: unknown, token: string) => {
  if (typeof value !== "string" || !value) return false;
  const haystack = value.toLowerCase();
  let from = 0;
  for (;;) {
    const at = haystack.indexOf(token, from);
    if (at === -1) return false;
    if (at === 0 || !WORD_CHAR.test(haystack[at - 1])) return true;
    from = at + 1;
  }
};

const dishFields = (item: any): unknown[] => [item?.name, item?.category, item?.description];

const vendorFields = (vendor: any): unknown[] => [
  vendor?.name,
  ...(Array.isArray(vendor?.categories) ? vendor.categories : []),
];

/** Every token starts a word in at least one of `fields`. */
export const allTokensIn = (fields: unknown[], tokens: string[]) =>
  tokens.length > 0 && tokens.every((token) => fields.some((field) => hasWordStartingWith(field, token)));

/** Every typed word is in the dish or its restaurant. */
export const dishMatches = (item: any, vendor: any, tokens: string[]) =>
  allTokensIn([...dishFields(item), ...vendorFields(vendor)], tokens);

/** Every typed word is in the restaurant's own name or cuisines. */
export const vendorMatches = (vendor: any, tokens: string[]) => allTokensIn(vendorFields(vendor), tokens);

/**
 * Higher is better. The whole phrase in the dish name ranks first (exact, then
 * prefix, then anywhere), then words found in the name, category, description,
 * and last words that only matched the restaurant.
 */
export const scoreDish = (item: any, vendor: any, term: string, tokens: string[]) => {
  const name = String(item?.name || "").toLowerCase().trim();
  const phrase = tokens.join(" ");
  const lowerTerm = term.toLowerCase().trim();

  let score = 0;
  if (name === lowerTerm || name === phrase) score += 200;
  else if (name.startsWith(lowerTerm) || name.startsWith(phrase)) score += 100;
  else if (name.includes(lowerTerm) || name.includes(phrase)) score += 50;

  for (const token of tokens) {
    if (hasWordStartingWith(item?.name, token)) score += 10;
    else if (hasWordStartingWith(item?.category, token)) score += 6;
    else if (hasWordStartingWith(item?.description, token)) score += 2;
    else if (vendorFields(vendor).some((field) => hasWordStartingWith(field, token))) score += 4;
  }

  return score;
};
