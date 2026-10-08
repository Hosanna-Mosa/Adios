import { EMPTY_DRAFT, MAX_ROWS, parseSheet, parseVeg, rowFromDraft, TEMPLATE_HEADERS, toBulkItem, toDraft } from "@/features/menu/bulk/parseRows";
import { discountPercent, parseNumber } from "@/utils/number";

const keys = (errors: { key: string }[]) => errors.map((e) => e.key.replace("bulkUpload.errors.", ""));

describe("parseSheet", () => {
  it("reads the template's own header row and example rows", () => {
    const out = parseSheet([
      TEMPLATE_HEADERS,
      ["Paneer Butter Masala", "Main Course", 249, 219, "Yes", "Rich gravy", 14, 420],
      ["Chicken Biryani", "Biryani", "₹299", "", "No", "", "", ""],
    ]);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.rows).toHaveLength(2);
    expect(out.rows[0]).toMatchObject({ sheetRow: 2, name: "Paneer Butter Masala", price: 249, offerPrice: 219, isVeg: true, protein: 14, calories: 420, errors: [] });
    expect(toBulkItem(out.rows[1])).toEqual({
      name: "Chicken Biryani", category: "Biryani", price: 299, description: undefined, offerPrice: null, isVeg: false, protein: null, calories: null,
    });
  });

  it("matches headers case-insensitively and without asterisks, in any order", () => {
    const out = parseSheet([["price", "NAME", "category", "veg"], [120, "Idli", "Breakfast", "veg"]]);
    expect(out.ok && out.rows[0]).toMatchObject({ name: "Idli", price: 120, category: "Breakfast", isVeg: true, errors: [] });
  });

  it("finds a header row below a title row and skips blank rows", () => {
    const out = parseSheet([["My menu"], [], TEMPLATE_HEADERS, ["Dosa", "Breakfast", 80], ["", "", ""], ["Vada", "Breakfast", 40]]);
    expect(out.ok && out.rows.map((r) => r.sheetRow)).toEqual([4, 6]);
  });

  it("reports each broken rule on its row", () => {
    const out = parseSheet([
      TEMPLATE_HEADERS,
      ["", "", 0, "", "maybe", "", -1, "lots"],
      ["Soup", "Starters", 100, 100, "N", "", "", ""],
      ["Salad", "Starters", 100, -5, "", "", "", ""],
    ]);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(keys(out.rows[0].errors)).toEqual(["nameRequired", "categoryRequired", "priceInvalid", "vegInvalid", "proteinInvalid", "caloriesInvalid"]);
    expect(keys(out.rows[1].errors)).toEqual(["offerTooHigh"]);
    expect(keys(out.rows[2].errors)).toEqual(["offerInvalid"]);
  });

  it("refuses a sheet without the required columns, an empty one, and one over the cap", () => {
    expect(parseSheet([["Dish", "Cost"], ["A", 1]])).toEqual({ ok: false, error: { key: "bulkUpload.errors.noHeader", params: { columns: "Category, Price" } } });
    expect(parseSheet([TEMPLATE_HEADERS])).toEqual({ ok: false, error: { key: "bulkUpload.errors.empty" } });
    const many = Array.from({ length: MAX_ROWS + 1 }, (_, i) => [`Dish ${i}`, "Mains", 100]);
    const out = parseSheet([TEMPLATE_HEADERS, ...many]);
    expect(!out.ok && out.error.key).toBe("bulkUpload.errors.tooMany");
  });
});

describe("parseVeg", () => {
  it.each([["Yes", true], ["y", true], ["Veg", true], [true, true], ["", true], ["No", false], ["N", false], ["Non-veg", false], ["non veg", false], ["false", false]])(
    "%p -> %p",
    (value, expected) => expect(parseVeg(value)).toBe(expected),
  );
  it("rejects anything else", () => expect(parseVeg("chicken")).toBeUndefined());
});

describe("number helpers", () => {
  it("parses prices typed with a rupee sign or commas", () => {
    expect(parseNumber("₹1,299.50")).toBe(1299.5);
    expect(parseNumber("  ")).toBeNull();
    expect(parseNumber("abc")).toBeNull();
  });
  it("rounds the discount like the backend, and only for a real offer", () => {
    expect(discountPercent(299, 249)).toBe(17);
    expect(discountPercent(299, 299)).toBeNull();
    expect(discountPercent(299, null)).toBeNull();
  });
});

describe("row editor drafts", () => {
  it("round-trips a sheet row through the editor unchanged", () => {
    const out = parseSheet([TEMPLATE_HEADERS, ["Paneer Tikka", "Starters", 280, 240, "Yes", "Smoky", 18, 320]]);
    if (!out.ok) throw new Error("expected rows");
    const row = out.rows[0];
    expect(rowFromDraft(toDraft(row), row.sheetRow)).toEqual(row);
  });

  it("applies the sheet's checks to an edited row", () => {
    const fixed = rowFromDraft({ ...EMPTY_DRAFT, name: "Dosa", category: "Breakfast", price: "80", offerPrice: "60", isVeg: false }, 7);
    expect(fixed).toMatchObject({ sheetRow: 7, price: 80, offerPrice: 60, isVeg: false, errors: [] });

    const bad = rowFromDraft({ ...EMPTY_DRAFT, name: "Dosa", price: "80", offerPrice: "90" }, 3);
    expect(bad.errors.map((e) => e.key)).toEqual(["bulkUpload.errors.categoryRequired", "bulkUpload.errors.offerTooHigh"]);
  });
});
