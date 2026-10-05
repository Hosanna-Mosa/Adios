#!/usr/bin/env node
/**
 * Verifies the three locale files agree with each other and with the code:
 *   1. every key used as t("…") / i18n.t("…") in the source exists in en/te/hi
 *      (a count-based key passes if it has _one/_other forms);
 *   2. te and hi have exactly the keys en has — nothing missing, nothing stale.
 * Keys built at runtime (t(meta.labelKey), t(`vehicle.${x}`)) can't be seen by
 * a scan; they are listed in DYNAMIC_KEYS below so they're still checked.
 *
 *   npm run i18n:check
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const LOCALES = ["en", "te", "hi"];
const SOURCE_DIRS = ["app", "components", "features", "contexts", "queries", "services", "utils", "i18n.ts"];

const DYNAMIC_KEYS = [
  "orderStatus.searchingDriver", "orderStatus.confirmed", "orderStatus.driverAssigned", "orderStatus.driverOnTheWay",
  "orderStatus.driverArrived", "orderStatus.readyForPickup", "orderStatus.outForDelivery", "orderStatus.driverAtCustomer",
  "orderStatus.delivered", "orderStatus.cancelled", "orderStatus.unknown",
  "orderStatus.newOrder", "orderStatus.preparingFindingDriver", "orderStatus.readyFindingDriver", "orderStatus.cancelledNotAccepted",
  "scheduled.statusPending", "scheduled.statusAccepted", "scheduled.statusRejected",
  "greeting.morning", "greeting.afternoon", "greeting.evening",
  "vehicle.bike", "vehicle.auto", "vehicle.car",
  ...["markReady", "soldOut", "scheduled", "pickupCode", "payouts", "password"].flatMap((k) => [`support.faqs.${k}.q`, `support.faqs.${k}.a`]),
];

const flatten = (obj, prefix = "", out = {}) => {
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object") flatten(value, full, out);
    else out[full] = value;
  }
  return out;
};

const walk = (target, files = []) => {
  const full = path.join(ROOT, target);
  if (!fs.existsSync(full)) return files;
  if (fs.statSync(full).isFile()) return [...files, full];
  for (const entry of fs.readdirSync(full)) {
    if (entry === "node_modules") continue;
    const child = path.join(target, entry);
    const childFull = path.join(ROOT, child);
    if (fs.statSync(childFull).isDirectory()) walk(child, files);
    else if (/\.(ts|tsx)$/.test(entry)) files.push(childFull);
  }
  return files;
};

const locales = Object.fromEntries(
  LOCALES.map((lng) => [lng, flatten(JSON.parse(fs.readFileSync(path.join(ROOT, "locales", lng, "common.json"), "utf8")))]),
);

const has = (dict, key) => key in dict || (`${key}_one` in dict && `${key}_other` in dict);

const used = new Set(DYNAMIC_KEYS);
const keyPattern = /\bt\(\s*["'`]([A-Za-z0-9_.]+)["'`]/g;
// Keys kept in lookup tables (e.g. { title: "orders.emptyActiveTitle" }): any
// string literal that starts with one of the locale's top-level namespaces.
const namespaces = Object.keys(JSON.parse(fs.readFileSync(path.join(ROOT, "locales", "en", "common.json"), "utf8")));
const literalPattern = new RegExp(`["'\`]((?:${namespaces.join("|")})\\.[A-Za-z0-9_.]+)["'\`]`, "g");
for (const file of SOURCE_DIRS.flatMap((dir) => walk(dir))) {
  const source = fs.readFileSync(file, "utf8");
  for (const match of source.matchAll(keyPattern)) used.add(match[1]);
  for (const match of source.matchAll(literalPattern)) used.add(match[1]);
}

let problems = 0;
for (const lng of LOCALES) {
  const missing = [...used].filter((key) => !has(locales[lng], key)).sort();
  if (missing.length) {
    problems += missing.length;
    console.error(`\n[${lng}] ${missing.length} key(s) used in code but missing:\n  ${missing.join("\n  ")}`);
  }
}

const enKeys = Object.keys(locales.en);
for (const lng of LOCALES.filter((l) => l !== "en")) {
  const missing = enKeys.filter((key) => !(key in locales[lng]));
  const extra = Object.keys(locales[lng]).filter((key) => !(key in locales.en));
  if (missing.length) {
    problems += missing.length;
    console.error(`\n[${lng}] ${missing.length} key(s) in en but not in ${lng}:\n  ${missing.join("\n  ")}`);
  }
  if (extra.length) {
    problems += extra.length;
    console.error(`\n[${lng}] ${extra.length} key(s) in ${lng} but not in en:\n  ${extra.join("\n  ")}`);
  }
}

const unused = enKeys
  .map((key) => key.replace(/_(one|other)$/, ""))
  .filter((key, i, all) => all.indexOf(key) === i && !used.has(key));
if (unused.length) console.warn(`\nNote: ${unused.length} en key(s) not referenced in code:\n  ${unused.join("\n  ")}`);

if (problems) {
  console.error(`\n✗ ${problems} locale problem(s).`);
  process.exit(1);
}
console.log(`✓ ${used.size} keys used in code; en/te/hi each define all of them (${enKeys.length} entries per locale).`);
