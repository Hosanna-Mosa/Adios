import { test } from "node:test";
import assert from "node:assert/strict";
import { dishMatches, hasWordStartingWith, scoreDish, toSearchTokens, vendorMatches } from "./food.search";

const bawarchi = { name: "Bawarchi", categories: ["Biryani", "North Indian"] };
const spiceHub = { name: "Spice Hub", categories: ["Chinese"] };

test("tokens drop punctuation and lowercase", () => {
  assert.deepEqual(toSearchTokens("  Chicken, Biryani! "), ["chicken", "biryani"]);
  assert.deepEqual(toSearchTokens("చికెన్ బిర్యానీ"), ["చికెన్", "బిర్యానీ"]);
});

test("a word must start where the token starts", () => {
  assert.equal(hasWordStartingWith("Chicken Biryani", "bir"), true);
  assert.equal(hasWordStartingWith("Grilled Steak", "tea"), false);
  assert.equal(hasWordStartingWith("Veggie Wrap", "egg"), false);
  assert.equal(hasWordStartingWith("Egg-fried rice", "fried"), true);
});

test("every typed word has to match", () => {
  const tokens = toSearchTokens("chicken biryani");
  assert.equal(dishMatches({ name: "Chicken Biryani" }, spiceHub, tokens), true);
  assert.equal(dishMatches({ name: "Chicken 65" }, spiceHub, tokens), false);
  assert.equal(dishMatches({ name: "Veg Biryani" }, spiceHub, tokens), false);
});

test("a word can come from the restaurant", () => {
  const tokens = toSearchTokens("bawarchi biryani");
  assert.equal(dishMatches({ name: "Mutton Biryani" }, bawarchi, tokens), true);
  assert.equal(dishMatches({ name: "Mutton Biryani" }, spiceHub, tokens), false);
});

test("restaurant match needs every word in its name or cuisines", () => {
  assert.equal(vendorMatches(bawarchi, toSearchTokens("bawarchi")), true);
  assert.equal(vendorMatches(bawarchi, toSearchTokens("bawarchi pizza")), false);
});

test("name hits rank above description and restaurant hits", () => {
  const tokens = toSearchTokens("biryani");
  const exact = scoreDish({ name: "Biryani" }, spiceHub, "biryani", tokens);
  const inName = scoreDish({ name: "Chicken Biryani" }, spiceHub, "biryani", tokens);
  const inDescription = scoreDish({ name: "Raita", description: "Goes well with biryani" }, spiceHub, "biryani", tokens);
  const viaRestaurant = scoreDish({ name: "Kebab" }, bawarchi, "biryani", tokens);
  assert.ok(exact > inName);
  assert.ok(inName > viaRestaurant);
  assert.ok(viaRestaurant > inDescription);
});
