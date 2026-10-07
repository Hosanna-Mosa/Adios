import type { BulkFoodItem } from "@/types/models";
import { isBlank, parseNumber } from "@/utils/number";

// Turns the rows of an uploaded sheet into dishes, checking each one with the
// same rules POST /food/bulk applies. Pure — no React, no files — so it is unit-tested.

export const MAX_ROWS = 500;

/** The template's header row, exactly as the contract names it. */
export const TEMPLATE_HEADERS = ["Name*", "Category*", "Price*", "Offer Price", "Veg (Yes/No)", "Description", "Protein (g)", "Calories (kcal)"];

type Field = "name" | "category" | "price" | "offerPrice" | "isVeg" | "description" | "protein" | "calories";

// Headers are compared lower-case with everything but letters stripped, so
// "Name*", "name", "NAME " and "Offer price" all match.
const ALIASES: Record<Field, string[]> = {
  name: ["name", "dishname", "itemname", "dish", "item"],
  category: ["category", "categories", "section"],
  price: ["price", "mrp", "rate"],
  offerPrice: ["offerprice", "offer", "discountprice", "discountedprice", "saleprice"],
  isVeg: ["vegyesno", "veg", "isveg", "vegnonveg", "type", "foodtype"],
  description: ["description", "desc", "details"],
  protein: ["proteing", "protein", "proteingrams"],
  calories: ["calorieskcal", "calories", "kcal", "calorie"],
};
const REQUIRED: Field[] = ["name", "category", "price"];
const LABELS: Record<Field, string> = {
  name: "Name", category: "Category", price: "Price", offerPrice: "Offer Price", isVeg: "Veg (Yes/No)",
  description: "Description", protein: "Protein (g)", calories: "Calories (kcal)",
};

export interface RowError {
  /** An i18n key under bulkUpload.errors. */
  key: string;
  params?: Record<string, string | number>;
}

export interface ParsedRow {
  /** 1-based row number in the sheet, as Excel shows it. */
  sheetRow: number;
  name: string;
  category: string;
  description: string;
  price: number | null;
  offerPrice: number | null;
  isVeg: boolean;
  protein: number | null;
  calories: number | null;
  errors: RowError[];
  /** Added in the app rather than read from the sheet. */
  isNew?: boolean;
  /** Changed in the app after it was read from the sheet. */
  edited?: boolean;
}

/** A row as the in-app row editor holds it: every number still a string, as typed. */
export interface RowDraft {
  name: string;
  category: string;
  description: string;
  price: string;
  offerPrice: string;
  isVeg: boolean;
  protein: string;
  calories: string;
}

export type ParseOutcome = { ok: true; rows: ParsedRow[] } | { ok: false; error: RowError };

const normalize = (value: unknown) => String(value ?? "").toLowerCase().replace(/[^a-z]/g, "");
const cellText = (value: unknown) => (value === null || value === undefined ? "" : String(value).trim());

function mapHeader(row: unknown[]): Partial<Record<Field, number>> {
  const map: Partial<Record<Field, number>> = {};
  row.forEach((cell, index) => {
    const key = normalize(cell);
    const field = (Object.keys(ALIASES) as Field[]).find((f) => ALIASES[f].includes(key));
    if (field && map[field] === undefined) map[field] = index;
  });
  return map;
}

/** Yes/No/Y/N/Veg/Non-veg/true/false (any case). Blank = veg. undefined = not understood. */
export function parseVeg(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (isBlank(value)) return true;
  const key = String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
  if (["yes", "y", "veg", "vegetarian", "true", "1", "v"].includes(key)) return true;
  if (["no", "n", "nonveg", "nonvegetarian", "false", "0", "nv"].includes(key)) return false;
  return undefined;
}

function parseRow(cells: unknown[], map: Partial<Record<Field, number>>, sheetRow: number): ParsedRow {
  const get = (field: Field) => (map[field] === undefined ? "" : cells[map[field] as number]);
  const errors: RowError[] = [];
  const optional = (field: "offerPrice" | "protein" | "calories") => {
    const raw = get(field);
    if (isBlank(raw)) return { value: null, bad: false };
    const n = parseNumber(raw);
    return { value: n, bad: n === null };
  };

  const name = cellText(get("name"));
  const category = cellText(get("category"));
  const price = parseNumber(get("price"));
  const offer = optional("offerPrice");
  const protein = optional("protein");
  const calories = optional("calories");
  const veg = parseVeg(get("isVeg"));

  if (!name) errors.push({ key: "bulkUpload.errors.nameRequired" });
  if (!category) errors.push({ key: "bulkUpload.errors.categoryRequired" });
  if (price === null || price <= 0) errors.push({ key: "bulkUpload.errors.priceInvalid" });
  if (offer.bad || (offer.value !== null && offer.value <= 0)) errors.push({ key: "bulkUpload.errors.offerInvalid" });
  else if (offer.value !== null && price !== null && price > 0 && offer.value >= price) errors.push({ key: "bulkUpload.errors.offerTooHigh" });
  if (veg === undefined) errors.push({ key: "bulkUpload.errors.vegInvalid", params: { value: cellText(get("isVeg")) } });
  if (protein.bad || (protein.value !== null && protein.value < 0)) errors.push({ key: "bulkUpload.errors.proteinInvalid" });
  if (calories.bad || (calories.value !== null && calories.value < 0)) errors.push({ key: "bulkUpload.errors.caloriesInvalid" });

  return {
    sheetRow,
    name,
    category,
    description: cellText(get("description")),
    price,
    offerPrice: offer.value,
    isVeg: veg ?? true,
    protein: protein.value,
    calories: calories.value,
    errors,
  };
}

/** Finds the header row (within the first 10 rows), then reads every non-empty row under it. */
export function parseSheet(matrix: unknown[][]): ParseOutcome {
  const headerIndex = matrix.slice(0, 10).findIndex((row) => {
    const map = mapHeader(row ?? []);
    return REQUIRED.every((f) => map[f] !== undefined);
  });
  if (headerIndex === -1) {
    const map = mapHeader(matrix[0] ?? []);
    const missing = REQUIRED.filter((f) => map[f] === undefined).map((f) => LABELS[f]);
    return { ok: false, error: { key: "bulkUpload.errors.noHeader", params: { columns: missing.join(", ") } } };
  }
  const map = mapHeader(matrix[headerIndex]);
  const rows: ParsedRow[] = [];
  matrix.slice(headerIndex + 1).forEach((cells, i) => {
    if (!cells || cells.every(isBlank)) return;
    rows.push(parseRow(cells, map, headerIndex + i + 2));
  });
  if (!rows.length) return { ok: false, error: { key: "bulkUpload.errors.empty" } };
  if (rows.length > MAX_ROWS) return { ok: false, error: { key: "bulkUpload.errors.tooMany", params: { count: rows.length, max: MAX_ROWS } } };
  return { ok: true, rows };
}

export const EMPTY_DRAFT: RowDraft = { name: "", category: "", description: "", price: "", offerPrice: "", isVeg: true, protein: "", calories: "" };

const numberText = (value: number | null) => (value === null ? "" : String(value));

/** Opens a row in the editor. */
export const toDraft = (row: ParsedRow): RowDraft => ({
  name: row.name,
  category: row.category,
  description: row.description,
  price: numberText(row.price),
  offerPrice: numberText(row.offerPrice),
  isVeg: row.isVeg,
  protein: numberText(row.protein),
  calories: numberText(row.calories),
});

// The editor's fields, laid out as cells so a draft goes through exactly the checks a sheet row does.
const DRAFT_MAP: Record<Field, number> = { name: 0, category: 1, price: 2, offerPrice: 3, isVeg: 4, description: 5, protein: 6, calories: 7 };

/** Re-checks an edited (or new) row with the same rules as a sheet row. */
export const rowFromDraft = (draft: RowDraft, sheetRow: number): ParsedRow =>
  parseRow(
    [draft.name, draft.category, draft.price, draft.offerPrice, draft.isVeg ? "Yes" : "No", draft.description, draft.protein, draft.calories],
    DRAFT_MAP,
    sheetRow,
  );

/** The POST /food/bulk item for a row that passed every check. */
export const toBulkItem = (row: ParsedRow): BulkFoodItem => ({
  name: row.name,
  category: row.category,
  price: row.price ?? 0,
  description: row.description || undefined,
  offerPrice: row.offerPrice,
  isVeg: row.isVeg,
  protein: row.protein,
  calories: row.calories,
});
