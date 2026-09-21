/** Time formatting for the earnings screen.
 *
 * `formatCurrency` now lives in utils/format.ts so the rest of the app can use
 * it too; it is re-exported here so existing imports keep working. */

export { formatCurrency } from "@/utils/format";

export function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}
