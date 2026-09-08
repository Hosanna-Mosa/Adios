import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseCsvRows, parseXlsxRows } from "./spreadsheet";
import { MENU_UPLOAD_COLUMNS } from "../features/onboarding/constants";

const fixturesDir = join(__dirname, "..", "..", "test-fixtures");

const loadFile = (name: string, type: string) => {
  const buffer = readFileSync(join(fixturesDir, name));
  return new File([buffer], name, { type });
};

// The known contents of test-fixtures/test-menu.csv / .xlsx — same 10 rows,
// row-for-row, in both files.
const expectedRows = [
  {
    category: "Starters",
    itemName: "Paneer Tikka",
    price: "249",
    description: "Chargrilled cottage cheese marinated in spiced yogurt",
    type: "Veg",
    isBestseller: "true",
  },
  {
    category: "Starters",
    itemName: "Chicken 65",
    price: "279",
    description: "Deep-fried spicy chicken bites tossed in curry leaves",
    type: "Non-Veg",
    isBestseller: "true",
  },
  {
    category: "Main Course",
    itemName: "Butter Chicken",
    price: "349",
    description: "Creamy tomato-based curry with tender chicken pieces",
    type: "Non-Veg",
    isBestseller: "true",
  },
  {
    category: "Main Course",
    itemName: "Dal Makhani",
    price: "229",
    description: "Slow-cooked black lentils finished with cream and butter",
    type: "Veg",
    isBestseller: "false",
  },
  {
    category: "Biryani",
    itemName: "Hyderabadi Chicken Biryani",
    price: "319",
    description:
      "Fragrant basmati rice layered with marinated chicken and saffron",
    type: "Non-Veg",
    isBestseller: "true",
  },
  {
    category: "Biryani",
    itemName: "Veg Dum Biryani",
    price: "259",
    description:
      "Basmati rice slow-cooked with mixed vegetables and whole spices",
    type: "Veg",
    isBestseller: "false",
  },
  {
    category: "Breads",
    itemName: "Butter Naan",
    price: "59",
    description: "Soft leavened flatbread brushed with butter",
    type: "Veg",
    isBestseller: "false",
  },
  {
    category: "Breads",
    itemName: "Garlic Kulcha",
    price: "69",
    description: "Stuffed flatbread topped with garlic and coriander",
    type: "Veg",
    isBestseller: "false",
  },
  {
    category: "Desserts",
    itemName: "Gulab Jamun",
    price: "99",
    description: "Soft milk dumplings soaked in rose-scented sugar syrup",
    type: "Veg",
    isBestseller: "true",
  },
  {
    category: "Beverages",
    itemName: "Masala Chaas",
    price: "49",
    description: "Spiced buttermilk with roasted cumin and fresh coriander",
    type: "Veg",
    isBestseller: "false",
  },
];

// Strip the fields the parsers generate/leave null (id, image) so we can
// compare directly against the fixture's known content.
const stripGenerated = (
  rows: { id: string; image: File | null; [key: string]: unknown }[],
) => rows.map(({ id: _id, image: _image, ...rest }) => rest);

describe("parseCsvRows", () => {
  it("parses test-menu.csv into the 10 expected rows", async () => {
    const file = loadFile("test-menu.csv", "text/csv");
    const rows = await parseCsvRows(file, MENU_UPLOAD_COLUMNS);
    expect(stripGenerated(rows)).toEqual(expectedRows);
  });
});

describe("parseXlsxRows", () => {
  it("parses test-menu.xlsx into the 10 expected rows", async () => {
    const file = loadFile(
      "test-menu.xlsx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    const rows = await parseXlsxRows(file, MENU_UPLOAD_COLUMNS);
    expect(stripGenerated(rows)).toEqual(expectedRows);
  });
});

describe("CSV vs XLSX parity", () => {
  it("produces identical output from both file formats", async () => {
    const csvFile = loadFile("test-menu.csv", "text/csv");
    const xlsxFile = loadFile(
      "test-menu.xlsx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    const csvRows = stripGenerated(
      await parseCsvRows(csvFile, MENU_UPLOAD_COLUMNS),
    );
    const xlsxRows = stripGenerated(
      await parseXlsxRows(xlsxFile, MENU_UPLOAD_COLUMNS),
    );
    expect(csvRows).toEqual(xlsxRows);
  });
});

describe("rowsFromTable via parseCsvRows — missing-column detection", () => {
  it("throws when a required column is missing", async () => {
    const buffer = Buffer.from(
      "category,itemName,price\nStarters,Paneer Tikka,249\n",
      "utf8",
    );
    const file = new File([buffer], "bad.csv", { type: "text/csv" });
    await expect(parseCsvRows(file, MENU_UPLOAD_COLUMNS)).rejects.toThrow(
      /Missing columns/,
    );
  });
});
