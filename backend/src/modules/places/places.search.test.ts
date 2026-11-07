import { test } from "node:test";
import assert from "node:assert/strict";
import { expandQueryVariants, interleaveSuggestions, mapNominatimResult, mergeSuggestions } from "./places.search";

test("the typed text always comes first and is never repeated", () => {
  const v = expandQueryVariants("Busstand Tadepalligudem");
  assert.equal(v[0], "Busstand Tadepalligudem");
  assert.equal(new Set(v.map((x) => x.toLowerCase())).size, v.length);
});

test("bus stand is also tried as bus station, in both spellings of the town", () => {
  const v = expandQueryVariants("Busstand Tadepalligudem").map((x) => x.toLowerCase());
  assert.ok(v.includes("bus station tadepalligudem"));
  assert.ok(v.some((x) => x.includes("tadepallegudem")));
});

test("other common short forms are expanded", () => {
  assert.ok(expandQueryVariants("rly stn kakinada").map((x) => x.toLowerCase()).includes("railway station kakinada"));
  assert.ok(expandQueryVariants("govt hosp").length >= 1);
});

test("plain text and empty text are handled", () => {
  assert.deepEqual(expandQueryVariants("Bawarchi"), ["Bawarchi"]);
  assert.deepEqual(expandQueryVariants("   "), []);
});

test("at most the requested number of variants", () => {
  assert.ok(expandQueryVariants("busstand tadepalligudem peta", 3).length <= 3);
});

test("merging keeps the order, drops repeats and respects the limit", () => {
  const google = [{ id: "g1", name: "APSRTC Bus Station", address: "APSRTC Bus Station, Tadepalligudem" }];
  const osm = [
    { id: "n1", name: "APSRTC Bus Station", address: "APSRTC Bus Station, Tadepalligudem", lat: 16.81, lng: 81.52 },
    { id: "n2", name: "Canal Bus Stop", address: "Canal Bus Stop, Tadepalligudem", lat: 16.82, lng: 81.53 },
  ];
  const merged = mergeSuggestions([google, osm]);
  assert.deepEqual(merged.map((m) => m.id), ["g1", "n2"]);
  assert.equal(mergeSuggestions([google, osm], 1).length, 1);
});

test("interleaving gives every list a fair share of the first slots", () => {
  const a = [{ id: "a1", name: "a1" }, { id: "a2", name: "a2" }, { id: "a3", name: "a3" }];
  const b = [{ id: "b1", name: "b1" }];
  const c = [{ id: "c1", name: "c1" }, { id: "c2", name: "c2" }];
  assert.deepEqual(interleaveSuggestions([a, b, c]).map((x) => x.id), ["a1", "b1", "c1", "a2", "c2", "a3"]);
  assert.deepEqual(interleaveSuggestions([]), []);
});

test("same name far apart are different places", () => {
  const a = { id: "a", name: "Indian Oil", address: "Indian Oil, Rajahmundry", lat: 17.0, lng: 81.78 };
  const b = { id: "b", name: "Indian Oil", address: "Indian Oil, Kakinada", lat: 16.9, lng: 82.2 };
  assert.equal(mergeSuggestions([[a], [b]]).length, 2);
});

test("Nominatim results use the app's place shape", () => {
  const r = mapNominatimResult({ osm_type: "node", osm_id: 5, lat: "16.8", lon: "81.5", display_name: "Canal Bus Stop, Tadepalligudem, Andhra Pradesh" });
  assert.equal(r.name, "Canal Bus Stop");
  assert.equal(r.lat, 16.8);
  assert.equal(r.lng, 81.5);
  assert.equal(r.source, "nominatim");
});
