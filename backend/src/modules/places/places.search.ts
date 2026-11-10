// Helpers for GET /places/autocomplete: other ways of writing what the customer typed, and
// merging the suggestions from several sources into one list without repeats.
//
// Why: Google's autocomplete often knows nothing about a small place written the way people
// say it ("Busstand Tadepalligudem" — Google and OpenStreetMap both list it as a bus station,
// and OSM spells the town "Tadepallegudem"). Searching a few spellings finds it.

/** Plain-text key for comparing places: lowercase, no punctuation, single spaces. */
export const normalizeText = (value: string) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

// Words people use for the same kind of place. Each rule turns the typed form into another
// form that map databases tend to use.
const SYNONYM_RULES: [RegExp, string[]][] = [
  [/\bbus\s?stand\b/i, ["bus station", "bus stop"]],
  [/\bbus\s?stop\b/i, ["bus station"]],
  [/\b(?:rly|railway|train)\s?(?:stn|station)\b/i, ["railway station"]],
  [/\bstn\b/i, ["station"]],
  [/\bhosp\b/i, ["hospital"]],
  [/\bjn\b|\bjunc\b/i, ["junction"]],
  [/\bcolony\b/i, ["colony", "nagar"]],
  [/\bnr\b/i, ["near"]],
];

// Town-name endings that are written two ways in the same area (Telugu names).
const SPELLING_RULES: [RegExp, string][] = [
  [/palli/gi, "palle"],
  [/palle/gi, "palli"],
  [/\bpeta\b/gi, "pet"],
  [/\bpet\b/gi, "peta"],
];

/**
 * The typed text first, then up to `max - 1` other ways of writing it (word forms, then
 * spellings). Never returns the same text twice.
 */
export function expandQueryVariants(input: string, max = 4): string[] {
  const original = String(input || "").trim().replace(/\s+/g, " ");
  if (!original) return [];
  const out: string[] = [original];
  const seen = new Set<string>([normalizeText(original)]);
  const add = (text: string) => {
    const key = normalizeText(text);
    if (key && !seen.has(key) && out.length < max) {
      seen.add(key);
      out.push(text.trim().replace(/\s+/g, " "));
    }
  };

  const worded: string[] = [];
  for (const [pattern, replacements] of SYNONYM_RULES) {
    if (!pattern.test(original)) continue;
    for (const replacement of replacements) worded.push(original.replace(pattern, replacement));
  }
  worded.forEach(add);

  // Spelling variants of the original, and of the first word-form (so "busstand tadepalligudem"
  // is also tried as "bus station tadepallegudem").
  for (const base of [original, worded[0]].filter(Boolean) as string[]) {
    for (const [pattern, replacement] of SPELLING_RULES) {
      if (pattern.test(base)) add(base.replace(pattern, replacement));
      pattern.lastIndex = 0;
    }
  }
  return out;
}

export interface PlaceSuggestion {
  id?: string;
  name?: string;
  address?: string;
  lat?: number;
  lng?: number;
  [key: string]: unknown;
}

/** Same place if the address matches, or the name matches and the points are within ~100 m. */
function samePlace(a: PlaceSuggestion, b: PlaceSuggestion) {
  if (a.id && b.id && a.id === b.id) return true;
  const addrA = normalizeText(a.address || "");
  const addrB = normalizeText(b.address || "");
  if (addrA && addrA === addrB) return true;
  const nameA = normalizeText(a.name || "");
  const nameB = normalizeText(b.name || "");
  if (nameA && nameA === nameB) {
    const hasPoints = [a.lat, a.lng, b.lat, b.lng].every((n) => Number.isFinite(n as number));
    if (!hasPoints) return true;
    return Math.abs((a.lat as number) - (b.lat as number)) < 0.001 && Math.abs((a.lng as number) - (b.lng as number)) < 0.001;
  }
  return false;
}

/**
 * One list that takes turns: first of each, then second of each, and so on. Used for the
 * results of different spellings, so each spelling gets a fair share of the slots instead
 * of the first one filling them all.
 */
export function interleaveSuggestions(lists: PlaceSuggestion[][]): PlaceSuggestion[] {
  const out: PlaceSuggestion[] = [];
  const longest = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < longest; i++) {
    for (const list of lists) if (i < list.length) out.push(list[i]);
  }
  return out;
}

/** Merges lists in priority order, dropping repeats, up to `limit` results. */
export function mergeSuggestions(lists: PlaceSuggestion[][], limit = 10): PlaceSuggestion[] {
  const merged: PlaceSuggestion[] = [];
  for (const list of lists) {
    for (const item of list) {
      if (merged.length >= limit) return merged;
      if (!item?.address && !item?.name) continue;
      if (merged.some((existing) => samePlace(existing, item))) continue;
      merged.push(item);
    }
  }
  return merged;
}

/** A Nominatim (OpenStreetMap) search hit in the shape the app already understands. */
export function mapNominatimResult(r: any): PlaceSuggestion {
  const display = String(r?.display_name || "");
  const parts = display.split(",").map((p) => p.trim()).filter(Boolean);
  const name = r?.name || parts[0] || display;
  return {
    id: `nominatim:${r?.osm_type || "x"}:${r?.osm_id ?? `${r?.lat},${r?.lon}`}`,
    name,
    address: display,
    main_text: name,
    secondary_text: parts.slice(1).join(", "),
    lat: Number(r?.lat),
    lng: Number(r?.lon),
    source: "nominatim",
  };
}
