import i18n from "@/i18n";

// Display formatting shared by every screen, so an amount, an order number or a
// timestamp reads the same on the dashboard, the orders list and a detail page.

const localeFor = () => (i18n.language === "hi" ? "hi-IN" : i18n.language === "te" ? "te-IN" : "en-IN");

export function formatCurrency(amount: number | undefined | null): string {
  const value = Number(amount) || 0;
  const rounded = Math.round(value * 100) / 100;
  return `₹${rounded.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

/**
 * An order id as the customer and rider apps show it. Readable ids — the
 * generated "ADSF051026172971" kind, and seeded "ORD-…" ones — are shown in
 * full; cutting them to the last six characters made "#172971" here while the
 * customer read "ADSF051026172971" on their side. Only a bare 24-character
 * Mongo id is still shortened, to "#ABC123".
 */
export function formatOrderId(id: string | undefined, short = true): string {
  if (!id) return "";
  if (!/^[a-f0-9]{24}$/i.test(id)) return id;
  return `#${(short ? id.slice(-6) : id).toUpperCase()}`;
}

export function formatTime(iso: string | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString(localeFor(), { hour: "numeric", minute: "2-digit" });
}

export function formatDateTime(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  return `${date.toLocaleDateString(localeFor(), { day: "numeric", month: "short" })} · ${formatTime(iso)}`;
}

export function formatLongDateTime(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  return `${date.toLocaleDateString(localeFor(), { weekday: "short", day: "numeric", month: "short" })} · ${formatTime(iso)}`;
}

/** "Today, 4:05 PM" / "Yesterday, 9:12 AM" / "12 Mar" — as on the customer app's support screen. */
export function formatRelativeDate(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return i18n.t("common.todayAt", { time: formatTime(iso) });
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return i18n.t("common.yesterdayAt", { time: formatTime(iso) });
  return date.toLocaleDateString(localeFor(), { day: "numeric", month: "short" });
}

export function isToday(iso: string | undefined): boolean {
  return !!iso && new Date(iso).toDateString() === new Date().toDateString();
}

export function greetingKey(): "greeting.morning" | "greeting.afternoon" | "greeting.evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "greeting.morning";
  if (hour < 17) return "greeting.afternoon";
  return "greeting.evening";
}
