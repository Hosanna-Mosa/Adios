/** One CSV cell. Cells that would be read as a spreadsheet formula get a leading apostrophe. */
export function csvCell(value: unknown): string {
  if (value == null) return "";
  let text = value instanceof Date ? value.toISOString() : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export const toCsv = (header: string[], rows: unknown[][]) => [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
