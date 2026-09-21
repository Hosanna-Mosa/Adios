#!/usr/bin/env node
// One-off codemod: every numeric fontSize / lineHeight in app/, components/ and
// features/ becomes a typography token.
//
//   node scripts/codemod-typography.js --dry     # print everything, write nothing
//   node scripts/codemod-typography.js --write   # apply
//
// Run --dry first and read the whole output. The REVIEW and MANUAL lists at the
// end are the cases a script should not decide on its own.
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIRS = ["app", "components", "features"];
// The root layout is edited by hand: its import order is load-bearing.
const SKIP = new Set([path.join(ROOT, "app", "_layout.tsx")]);
const WRITE = process.argv.includes("--write");

// ---- the four sizes. Change these for a new app. ----
const SIZES = { small: 11, medium: 14, large: 17, extraLarge: 24 };
const LH = { small: 15, medium: 20, large: 24, extraLarge: 34 };

// Nearest key by value; ties go to the larger value.
function nearest(n, table) {
  let best = null, bestD = Infinity;
  for (const [k, v] of Object.entries(table)) {
    const d = Math.abs(v - n);
    if (d < bestD || (d === bestD && v > table[best])) { best = k; bestD = d; }
  }
  return best;
}

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== "node_modules") walk(p, out); }
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

// Index of the "{" that opens the object containing position i. This is what
// lets a lineHeight inherit the token of the fontSize in the same style object.
function enclosingBrace(src, i) {
  let depth = 0;
  for (let j = i - 1; j >= 0; j--) {
    const c = src[j];
    if (c === "}") depth++;
    else if (c === "{") { if (depth === 0) return j; depth--; }
  }
  return -1;
}

const NUM = "(?:moderateScale\\(\\s*([\\d.]+)\\s*\\)|([\\d.]+))";
const RE_FS = new RegExp("\\bfontSize:\\s*" + NUM + "(?=\\s*[,}\\r\\n]|\\s*$)", "g");
const RE_LH = new RegExp("\\blineHeight:\\s*" + NUM + "(?=\\s*[,}\\r\\n]|\\s*$)", "g");

let totals = { files: 0, fontSize: 0, lineHeight: 0, importsAdded: 0, msRemoved: 0 };
const manual = [], review = [], warnings = [];

const files = DIRS.flatMap((d) => walk(path.join(ROOT, d), []));
for (const file of files) {
  if (SKIP.has(file)) continue;
  const src = fs.readFileSync(file, "utf8");
  const rel = path.relative(ROOT, file);
  const edits = [];              // {start, end, text, old}
  const objToken = new Map();    // enclosing "{" index -> size token

  for (const m of src.matchAll(RE_FS)) {
    const n = parseFloat(m[1] ?? m[2]);
    const tok = nearest(n, SIZES);
    objToken.set(enclosingBrace(src, m.index), tok);
    edits.push({ start: m.index, end: m.index + m[0].length,
                 text: `fontSize: typography.sizes.${tok}`, old: m[0] });
  }
  for (const m of src.matchAll(RE_LH)) {
    const n = parseFloat(m[1] ?? m[2]);
    const byValue = nearest(n, LH);
    const byObj = objToken.get(enclosingBrace(src, m.index));
    const tok = byObj ?? byValue;
    if (byObj && byObj !== byValue)
      review.push(`${rel}: lineHeight ${n} -> ${byObj} (object fontSize) instead of ${byValue} (nearest value)`);
    if (!byObj)
      review.push(`${rel}: lineHeight ${n} has no fontSize in its object -> ${byValue}`);
    edits.push({ start: m.index, end: m.index + m[0].length,
                 text: `lineHeight: typography.lineHeights.${tok}`, old: m[0] });
  }

  // Anything left naming a raw fontSize/lineHeight is for hand review.
  const covered = new Set(edits.map((e) => e.start));
  for (const m of src.matchAll(/\b(fontSize|lineHeight)\s*:\s*(?!typography\.)([^,}\n]+)/g)) {
    if (!covered.has(m.index)) {
      const line = src.slice(0, m.index).split("\n").length;
      manual.push(`${rel}:${line}: ${m[0].trim()}`);
    }
  }
  if (edits.length === 0) continue;

  if (/\b(const|let|var|function)\s+typography\b/.test(src))
    warnings.push(`${rel}: defines its own 'typography' identifier`);

  edits.sort((a, b) => b.start - a.start);   // apply back to front
  let out = src;
  for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);

  // --- imports ---
  if (!/\bimport\s*\{[^}]*\btypography\b[^}]*\}\s*from\s*["']@\/constants\/typography["']/.test(out)) {
    const ff = /import\s*\{\s*fontFamilies\s*\}\s*from\s*(["'])@\/constants\/typography\1;?/;
    if (ff.test(out)) {
      out = out.replace(ff, (s, q) => `import { fontFamilies, typography } from ${q}@/constants/typography${q};`);
    } else {
      const lines = out.split("\n");
      let last = -1;
      for (let i = 0; i < lines.length; i++)
        if (/^import\b/.test(lines[i]) || /^\s*\}\s*from\s*["'][^"']+["'];?\s*$/.test(lines[i])) last = i;
      lines.splice(last + 1, 0, `import { typography } from "@/constants/typography";`);
      out = lines.join("\n");
    }
    totals.importsAdded++;
  }
  if (!/\bmoderateScale\s*\(/.test(out)) {
    const before = out;
    out = out.replace(/^import\s*\{([^}]*)\}\s*from\s*["']react-native-size-matters["'];?\s*\r?\n/m,
      (s, names) => {
        const rest = names.split(",").map((x) => x.trim()).filter((x) => x && x !== "moderateScale");
        return rest.length ? `import { ${rest.join(", ")} } from "react-native-size-matters";\n` : "";
      });
    if (out !== before) totals.msRemoved++;
  }

  const nFs = edits.filter((e) => e.text.startsWith("fontSize")).length;
  totals.files++; totals.fontSize += nFs; totals.lineHeight += edits.length - nFs;
  console.log(`\n### ${rel}  (${nFs} fontSize, ${edits.length - nFs} lineHeight)`);
  for (const e of [...edits].reverse()) console.log(`  - ${e.old}\n  + ${e.text}`);
  if (WRITE) fs.writeFileSync(file, out);
}

console.log("\n=== SUMMARY ===");
console.log(totals);
console.log(`\n=== REVIEW (${review.length}) ===`); review.forEach((r) => console.log("  " + r));
console.log(`\n=== MANUAL (${manual.length}) ===`); manual.forEach((r) => console.log("  " + r));
console.log(`\n=== WARNINGS (${warnings.length}) ===`); warnings.forEach((r) => console.log("  " + r));
console.log(WRITE ? "\nWROTE files." : "\nDRY RUN: nothing written.");
