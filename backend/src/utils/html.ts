/** Escapes text for use in HTML element content or a quoted attribute value. */
export const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

/**
 * A copy of `value` with every string escaped for HTML, for templates that
 * interpolate a whole document (an order with its customer, vendor and driver
 * populated). Names, addresses and notes are typed by customers, vendors and
 * drivers; escaping them all up front means a template field added later is
 * covered too. Mongoose documents are converted with toObject(); Dates,
 * ObjectIds and other class instances pass through untouched.
 */
export function escapeForHtml<T>(value: T): T {
  const source: unknown =
    value && typeof (value as any).toObject === "function" ? (value as any).toObject() : value;

  if (typeof source === "string") return escapeHtml(source) as T;
  if (Array.isArray(source)) return source.map((item) => escapeForHtml(item)) as T;
  if (isPlainObject(source)) {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(source)) out[key] = escapeForHtml(child);
    return out as T;
  }
  return source as T;
}
