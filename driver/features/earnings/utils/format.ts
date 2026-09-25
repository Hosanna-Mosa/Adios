/** Time formatting for the earnings screen.
 *
 * `formatCurrency` now lives in utils/format.ts so the rest of the app can use
 * it too; it is re-exported here so existing imports keep working. */
import i18n from "@/i18n";

export { formatCurrency } from "@/utils/format";

// Plain helper (not a hook), called from deep inside the render tree via a
// prop reference — reads the shared i18n instance's t() directly instead of
// the useTranslation() hook.
export function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  if (minutes < 60) return i18n.t("earnings.minAgo", { value: minutes, defaultValue: "{{value}} min ago" });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return i18n.t("earnings.hoursAgo", { value: hours, defaultValue: "{{value}} hours ago" });
  const days = Math.floor(hours / 24);
  return i18n.t("earnings.daysAgo", { value: days, defaultValue: "{{value}} days ago" });
}
