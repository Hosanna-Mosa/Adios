// Photos for the "Browse by cuisine" circles. These used to be emoji, which
// meant every cuisine without an entry fell back to a plate glyph — "Andhra
// Special" and "Tandoori" both rendered as 🍽️.
//
// Keys are matched case-insensitively against the cuisine name the vendors
// return, and a name that contains a key still matches (so "Andhra Biryani"
// picks up the Biryani photo). Anything unmatched gets FALLBACK_CUISINE_IMAGE.
const IMAGE_BASE = "https://images.unsplash.com/";
const RENDITION = "?w=160&h=160&fit=crop&q=70";

const PHOTOS: { [cuisine: string]: string } = {
  biryani: "photo-1563379091339-03b21ab4a4f8",
  "andhra special": "photo-1631515243349-e0cb75fb8d3a",
  andhra: "photo-1631515243349-e0cb75fb8d3a",
  tandoori: "photo-1610057099431-d73a1c9d2f2f",
  "north indian": "photo-1585937421612-70a008356fbe",
  "south indian": "photo-1589301760014-d929f3979dbc",
  tiffins: "photo-1589301760014-d929f3979dbc",
  dosa: "photo-1589301760014-d929f3979dbc",
  idly: "photo-1589301760014-d929f3979dbc",
  breakfast: "photo-1504674900247-0877df9cc836",
  chinese: "photo-1585032226651-759b368d7246",
  noodles: "photo-1585032226651-759b368d7246",
  "fried rice": "photo-1512621776951-a57141f2eefd",
  pizza: "photo-1513104890138-7c749659a591",
  burgers: "photo-1568901346375-23c9450c58cd",
  "fast food": "photo-1568901346375-23c9450c58cd",
  rolls: "photo-1626700051175-6818013e1d4f",
  kebabs: "photo-1599487488170-d11ec9c172f0",
  mughlai: "photo-1599487488170-d11ec9c172f0",
  starters: "photo-1599487488170-d11ec9c172f0",
  sweets: "photo-1551024506-0bccd828d307",
  desserts: "photo-1551024506-0bccd828d307",
  "tea & coffee": "photo-1495521821757-a1efb6729352",
  healthy: "photo-1512621776951-a57141f2eefd",
  paneer: "photo-1601050690597-df0568f70950",
  meals: "photo-1567188040759-fb8a883dc6d8",
  thali: "photo-1567188040759-fb8a883dc6d8",
  "main course": "photo-1567188040759-fb8a883dc6d8",
  chicken: "photo-1604503468506-a8da13d82791",
  mutton: "photo-1603360946369-dc9bb6258143",
  // seafood: "photo-1615141982883-c7ad0e69fd62",
  // fish: "photo-1615141982883-c7ad0e69fd62",
  // prawns: "photo-1615141982883-c7ad0e69fd62",
  eggs: "photo-1482049016688-2d3e1b311543",
};

export const FALLBACK_CUISINE_IMAGE = `${IMAGE_BASE}photo-1546069901-ba9599a7e63c${RENDITION}`;

export function cuisineImageUrl(cuisine: string) {
  const key = cuisine.trim().toLowerCase();
  const exact = PHOTOS[key];
  if (exact) return `${IMAGE_BASE}${exact}${RENDITION}`;

  // Longest key first, so "south indian" wins over "indian"-style substrings.
  const partial = Object.keys(PHOTOS)
    .sort((a, b) => b.length - a.length)
    .find((candidate) => key.includes(candidate));
  return partial ? `${IMAGE_BASE}${PHOTOS[partial]}${RENDITION}` : FALLBACK_CUISINE_IMAGE;
}
