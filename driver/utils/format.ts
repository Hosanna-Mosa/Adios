/** Shared value formatting.
 *
 * `formatCurrency` lived in features/earnings/utils/format.ts and was used by
 * four earnings call sites, while 20-odd other places interpolated `₹` by hand
 * — some with two decimals, some without. This is the one implementation; the
 * old path re-exports it so those four call sites keep working unchanged.
 */

/** Rupee amount.
 *
 * Defaults to two decimals, which is what the original earnings-only helper
 * did. Pass `{ decimals: false }` for the whole-rupee form used on the home and
 * profile screens: that branch interpolates the value verbatim rather than
 * coercing it, because those call sites are typed `number | string` and may
 * carry a pre-formatted string — `Number()` would turn "1,234" into NaN, and
 * rounding would change what is already on screen.
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  opts?: { decimals?: boolean },
): string {
  if (opts?.decimals === false) return `₹${amount ?? ""}`;
  return `₹${Number(amount || 0).toFixed(2)}`;
}
