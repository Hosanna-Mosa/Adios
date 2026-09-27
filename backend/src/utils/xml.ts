/**
 * Minimal dependency-free XML reader.
 *
 * DigiLocker returns document payloads as XML (eAadhaar KYC, PAN certificate,
 * driving licence, ...). Those payloads are small and attribute-heavy, so a
 * full XML stack would be overkill — this covers elements, attributes, text,
 * CDATA, comments, and self-closing tags, which is everything DigiLocker emits.
 *
 * Not a general-purpose parser: no DTD/entity declarations, no namespaces
 * resolution (prefixed names are kept verbatim and also indexed by local name).
 */

export interface XmlNode {
  name: string;
  attributes: Record<string, string>;
  children: XmlNode[];
  text: string;
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

function decodeEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity: string) => {
    if (entity[0] === "#") {
      const codePoint =
        entity[1] === "x" || entity[1] === "X"
          ? parseInt(entity.slice(2), 16)
          : parseInt(entity.slice(1), 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }
    const mapped = ENTITIES[entity.toLowerCase()];
    return mapped !== undefined ? mapped : match;
  });
}

function parseAttributes(raw: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const pattern = /([\w:.-]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(raw)) !== null) {
    const value = match[3] !== undefined ? match[3] : match[4] || "";
    attributes[match[1]] = decodeEntities(value);
  }

  return attributes;
}

/**
 * Parse an XML document into a node tree. Returns `null` when the input has no
 * parseable root element (empty string, HTML error page, malformed response).
 */
export function parseXml(xml: string): XmlNode | null {
  if (!xml || typeof xml !== "string") return null;

  // Strip the prolog, comments, CDATA markers (keeping their content), and DOCTYPE.
  const source = xml
    .replace(/<\?[\s\S]*?\?>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<!DOCTYPE[^>[]*(\[[\s\S]*?\])?>/gi, "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_m, content: string) =>
      content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    );

  const tagPattern = /<\s*(\/?)\s*([\w:.-]+)((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)\s*>/g;

  const stack: XmlNode[] = [];
  let root: XmlNode | null = null;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(source)) !== null) {
    const [full, closing, name, rawAttrs, selfClosing] = match;

    // Text sitting between the previous tag and this one belongs to the open element.
    if (stack.length > 0) {
      const text = decodeEntities(source.slice(cursor, match.index)).trim();
      if (text) {
        const parent = stack[stack.length - 1];
        parent.text = parent.text ? `${parent.text} ${text}` : text;
      }
    }
    cursor = match.index + full.length;

    if (closing) {
      // Pop back to the matching open tag; tolerate unbalanced markup.
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].name === name) {
          stack.length = i;
          break;
        }
      }
      continue;
    }

    const node: XmlNode = { name, attributes: parseAttributes(rawAttrs), children: [], text: "" };

    if (stack.length === 0) {
      if (!root) root = node;
    } else {
      stack[stack.length - 1].children.push(node);
    }

    if (!selfClosing) stack.push(node);
  }

  return root;
}

function localName(name: string): string {
  const idx = name.indexOf(":");
  return idx === -1 ? name : name.slice(idx + 1);
}

function matchesName(node: XmlNode, name: string): boolean {
  const target = name.toLowerCase();
  return node.name.toLowerCase() === target || localName(node.name).toLowerCase() === target;
}

/** Depth-first search for every element with the given (case-insensitive) tag name. */
export function findAll(node: XmlNode | null, name: string): XmlNode[] {
  if (!node) return [];
  const found: XmlNode[] = [];

  const walk = (current: XmlNode) => {
    if (matchesName(current, name)) found.push(current);
    for (const child of current.children) walk(child);
  };

  walk(node);
  return found;
}

/** Depth-first search for the first element with the given tag name. */
export function findFirst(node: XmlNode | null, name: string): XmlNode | null {
  if (!node) return null;
  if (matchesName(node, name)) return node;

  for (const child of node.children) {
    const found = findFirst(child, name);
    if (found) return found;
  }

  return null;
}

/**
 * Read an attribute from a node, trying each candidate name in order
 * (case-insensitively). DigiLocker issuers are inconsistent about casing,
 * e.g. `dob` vs `DOB` vs `dateOfBirth`.
 */
export function attr(node: XmlNode | null, ...names: string[]): string | undefined {
  if (!node) return undefined;

  const entries = Object.entries(node.attributes);
  for (const name of names) {
    const target = name.toLowerCase();
    const hit = entries.find(([key]) => key.toLowerCase() === target || localName(key).toLowerCase() === target);
    if (hit && hit[1]) return hit[1];
  }

  return undefined;
}

/**
 * Read a value that an issuer may expose either as an attribute on `node` or
 * as the text of a child element — both shapes appear across DigiLocker docs.
 */
export function value(node: XmlNode | null, ...names: string[]): string | undefined {
  const fromAttr = attr(node, ...names);
  if (fromAttr) return fromAttr;

  if (!node) return undefined;
  for (const name of names) {
    const child = findFirst(node, name);
    if (child?.text) return child.text;
  }

  return undefined;
}
