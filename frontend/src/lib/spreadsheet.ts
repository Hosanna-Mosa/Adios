const normalizeHeader = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

const toCanonicalHeader = (value: string) => {
  const normalized = normalizeHeader(value);
  if (["category", "menucategory", "productcategory"].includes(normalized))
    return "category";
  if (
    ["itemname", "item", "name", "productname", "product"].includes(normalized)
  )
    return "itemName";
  if (
    ["price", "priceinr", "price₹", "price rs", "rate"]
      .map(normalizeHeader)
      .includes(normalized)
  )
    return "price";
  if (["description", "desc", "details"].includes(normalized))
    return "description";
  if (
    ["type", "veg/nonveg", "cuttype", "producttype"]
      .map(normalizeHeader)
      .includes(normalized)
  )
    return "type";
  if (["isbestseller", "bestseller", "tags", "tag"].includes(normalized))
    return "isBestseller";
  return normalized;
};

const parseCsvLine = (line: string) => {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
};

const rowsFromTable = (rows: string[][], requiredColumns: string[]) => {
  if (rows.length === 0) {
    throw new Error("The uploaded sheet is empty.");
  }

  const headers = rows[0].map(toCanonicalHeader);
  const headerIndex = new Map(headers.map((header, index) => [header, index]));
  const missingColumns = requiredColumns.filter(
    (column) => !headerIndex.has(column),
  );

  if (missingColumns.length > 0) {
    throw new Error(`Missing columns: ${missingColumns.join(", ")}`);
  }

  const parsedRows = rows
    .slice(1)
    .map((row) => ({
      id: crypto.randomUUID(),
      category: row[headerIndex.get("category") ?? -1]?.trim() || "",
      itemName: row[headerIndex.get("itemName") ?? -1]?.trim() || "",
      price: row[headerIndex.get("price") ?? -1]?.trim() || "",
      description: row[headerIndex.get("description") ?? -1]?.trim() || "",
      type: row[headerIndex.get("type") ?? -1]?.trim() || "",
      isBestseller: row[headerIndex.get("isBestseller") ?? -1]?.trim() || "",
      image: null,
    }))
    .filter(
      (row) =>
        row.category ||
        row.itemName ||
        row.price ||
        row.description ||
        row.type ||
        row.isBestseller,
    );

  if (parsedRows.length === 0) {
    throw new Error("Add at least one item row to the uploaded sheet.");
  }

  return parsedRows;
};

const readFileAsText = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () =>
      reject(new Error("Unable to read the uploaded menu sheet."));
    reader.readAsText(file);
  });

const parseCsvRows = async (file: File, requiredColumns: string[]) => {
  const text = await readFileAsText(file);
  const rows = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseCsvLine);

  return rowsFromTable(rows, requiredColumns);
};

const getCellColumnIndex = (cellRef: string) => {
  const letters = (cellRef.match(/[A-Z]+/i)?.[0] || "").toUpperCase();
  return (
    letters
      .split("")
      .reduce((sum, letter) => sum * 26 + letter.charCodeAt(0) - 64, 0) - 1
  );
};

const getXmlText = async (bytes: Uint8Array, method: number) => {
  if (method === 0) {
    return new TextDecoder().decode(bytes);
  }

  const DecompressionCtor = window.DecompressionStream;
  if (!DecompressionCtor) {
    throw new Error(
      "This browser cannot read XLSX files here. Please upload a CSV file.",
    );
  }

  const blobBuffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
  const stream = new Blob([blobBuffer])
    .stream()
    .pipeThrough(new DecompressionCtor("deflate-raw"));
  return new TextDecoder().decode(await new Response(stream).arrayBuffer());
};

const readZipEntries = async (buffer: ArrayBuffer) => {
  const data = new Uint8Array(buffer);
  const view = new DataView(buffer);
  let eocdOffset = -1;

  for (let i = data.length - 22; i >= 0; i -= 1) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset === -1) {
    throw new Error("Unable to read the XLSX file.");
  }

  const totalEntries = view.getUint16(eocdOffset + 10, true);
  let centralOffset = view.getUint32(eocdOffset + 16, true);
  const entries = new Map<string, () => Promise<string>>();

  for (let i = 0; i < totalEntries; i += 1) {
    if (view.getUint32(centralOffset, true) !== 0x02014b50) break;

    const method = view.getUint16(centralOffset + 10, true);
    const compressedSize = view.getUint32(centralOffset + 20, true);
    const fileNameLength = view.getUint16(centralOffset + 28, true);
    const extraLength = view.getUint16(centralOffset + 30, true);
    const commentLength = view.getUint16(centralOffset + 32, true);
    const localOffset = view.getUint32(centralOffset + 42, true);
    const nameBytes = data.slice(
      centralOffset + 46,
      centralOffset + 46 + fileNameLength,
    );
    const name = new TextDecoder().decode(nameBytes);

    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const compressedBytes = data.slice(dataStart, dataStart + compressedSize);

    entries.set(name, () => getXmlText(compressedBytes, method));
    centralOffset += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
};

const parseSharedStrings = (xmlText?: string) => {
  if (!xmlText) return [];
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  return Array.from(xml.getElementsByTagName("si")).map((item) =>
    Array.from(item.getElementsByTagName("t"))
      .map((textNode) => textNode.textContent || "")
      .join(""),
  );
};

const parseXlsxRows = async (file: File, requiredColumns: string[]) => {
  const entries = await readZipEntries(await file.arrayBuffer());
  const sheetEntry = entries.get("xl/worksheets/sheet1.xml");

  if (!sheetEntry) {
    throw new Error("The XLSX file must include a first worksheet.");
  }

  const sharedStrings = entries.get("xl/sharedStrings.xml")
    ? parseSharedStrings(await entries.get("xl/sharedStrings.xml")!())
    : [];
  const sheetXml = new DOMParser().parseFromString(
    await sheetEntry(),
    "application/xml",
  );
  const rows = Array.from(sheetXml.getElementsByTagName("row")).map((row) => {
    const values: string[] = [];
    Array.from(row.getElementsByTagName("c")).forEach((cell) => {
      const ref = cell.getAttribute("r") || "";
      const index = getCellColumnIndex(ref);
      const type = cell.getAttribute("t");
      const valueNode = cell.getElementsByTagName("v")[0];
      const inlineNode = cell.getElementsByTagName("t")[0];
      const rawValue = valueNode?.textContent || inlineNode?.textContent || "";
      values[index] =
        type === "s" ? sharedStrings[Number(rawValue)] || "" : rawValue;
    });
    return values.map((value) => value || "");
  });

  return rowsFromTable(rows, requiredColumns);
};
export {
  normalizeHeader,
  toCanonicalHeader,
  parseCsvLine,
  rowsFromTable,
  readFileAsText,
  parseCsvRows,
  getCellColumnIndex,
  getXmlText,
  readZipEntries,
  parseSharedStrings,
  parseXlsxRows,
};
