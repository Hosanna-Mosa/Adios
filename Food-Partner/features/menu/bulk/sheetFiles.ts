import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";
import { TEMPLATE_HEADERS } from "./parseRows";

// The Excel side of the bulk upload: building the template in the app (SheetJS),
// saving it to the cache and handing it to the share sheet, and reading back a
// filled-in .xlsx / .xls / .csv the owner picks.

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const TEMPLATE_NAME = "adios-menu-template.xlsx";

const EXAMPLE_ROWS = [
  ["Paneer Butter Masala", "Main Course", 249, 219, "Yes", "Cottage cheese in a rich tomato and butter gravy", 14, 420],
  ["Chicken Dum Biryani", "Biryani", 299, "", "No", "Hyderabadi dum biryani served with raita and salan", 28, 650],
];
const COLUMN_WIDTHS = [28, 18, 10, 13, 14, 48, 13, 16];

/** The template workbook: sheet "Menu", the header row, two example rows. */
export function buildTemplate(): Uint8Array {
  const sheet = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ...EXAMPLE_ROWS]);
  sheet["!cols"] = COLUMN_WIDTHS.map((wch) => ({ wch }));
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Menu");
  const data: ArrayBuffer = XLSX.write(book, { type: "array", bookType: "xlsx" });
  return new Uint8Array(data);
}

/** Writes the template to the cache and opens the share sheet (save to Files, WhatsApp, email…). */
export async function shareTemplate(dialogTitle: string) {
  const file = new File(Paths.cache, TEMPLATE_NAME);
  if (file.exists) file.delete();
  file.create();
  file.write(buildTemplate());
  if (!(await Sharing.isAvailableAsync())) throw new Error("sharing-unavailable");
  await Sharing.shareAsync(file.uri, { mimeType: XLSX_MIME, dialogTitle, UTI: "org.openxmlformats.spreadsheetml.sheet" });
}

export interface PickedSheet {
  name: string;
  /** Every row of the first sheet ("Menu" when present), cells as typed. */
  matrix: unknown[][];
}

/** Lets the owner pick a sheet and reads it. null when they cancel. */
export async function pickSheet(): Promise<PickedSheet | null> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: [XLSX_MIME, "application/vnd.ms-excel", "text/csv", "text/comma-separated-values", "application/csv",
      // Some Android file managers report .xlsx as a bare binary.
      "application/octet-stream"],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (picked.canceled || !picked.assets?.length) return null;
  const asset = picked.assets[0];
  const bytes = await new File(asset.uri).bytes();
  const book = XLSX.read(bytes, { type: "array" });
  const sheetName = book.SheetNames.find((n) => n.trim().toLowerCase() === "menu") ?? book.SheetNames[0];
  const sheet = sheetName ? book.Sheets[sheetName] : undefined;
  const matrix = sheet ? XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", blankrows: false, raw: true }) : [];
  return { name: asset.name, matrix };
}
