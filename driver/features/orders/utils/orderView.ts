import type { Ionicons } from "@expo/vector-icons";
import { Colors, services } from "@/constants/colors";
import type { DriverOrder } from "../types";

const CANCELLED = ["cancelled"];
const FINISHED = ["completed", "delivered"];

export type OrderTone = "success" | "danger" | "active";

/** What the badge says and how it is coloured. Statuses come in both upper and lower case. */
export function orderStatusView(status: string): { labelKey: string; fallback: string; tone: OrderTone } {
  const s = (status || "").toLowerCase();
  if (CANCELLED.includes(s)) return { labelKey: "orders.statusCancelled", fallback: "Cancelled", tone: "danger" };
  if (FINISHED.includes(s)) return { labelKey: "orders.statusCompleted", fallback: "Completed", tone: "success" };
  return { labelKey: "orders.statusOngoing", fallback: "Ongoing", tone: "active" };
}

export function toneColors(tone: OrderTone) {
  if (tone === "success") return { fg: Colors.success, bg: Colors.successLight };
  if (tone === "danger") return { fg: Colors.error, bg: Colors.errorLight };
  return { fg: Colors.primaryDark, bg: Colors.brandSkin };
}

export function isOrderLive(status: string) {
  const s = (status || "").toLowerCase();
  return !CANCELLED.includes(s) && !FINISHED.includes(s);
}

export function isCancelled(status: string) {
  return CANCELLED.includes((status || "").toLowerCase());
}

/** Same 80% share the active-order screen and wallet use. A cancelled order pays nothing. */
export function driverShare(order: Pick<DriverOrder, "totalPrice" | "status">) {
  if (isCancelled(order.status)) return 0;
  return Math.round((Number(order.totalPrice) || 0) * 0.8);
}

export function outletName(order: DriverOrder) {
  if (order.outlet?.name) return order.outlet.name;
  return order.vendor && typeof order.vendor === "object" ? order.vendor.name : undefined;
}

export function stopAddress(order: DriverOrder, kind: "pickup" | "drop") {
  const stops = order.stops || [];
  const match =
    kind === "pickup"
      ? stops.find((s) => s.type?.toLowerCase() === "pickup")
      : [...stops].reverse().find((s) => ["drop", "delivery"].includes(s.type?.toLowerCase()));
  return match?.address || "";
}

// ─── What kind of job it was ──────────────────────────────────────────────────────────────────

export interface ServiceVisual {
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  skin: string;
  /** i18n key and English fallback for the job type, e.g. "Bike ride". */
  labelKey: string;
  fallback: string;
}

const RIDE_LABELS: Record<string, { icon: ServiceVisual["icon"]; fallback: string }> = {
  bike: { icon: "bicycle", fallback: "Bike ride" },
  auto: { icon: "car-sport", fallback: "Auto ride" },
  cab: { icon: "car", fallback: "Cab ride" },
  cab_prime: { icon: "car", fallback: "Cab Prime ride" },
};

/** Icon, colour and name for the kind of job, so a list of orders can be scanned at a glance. */
export function serviceVisual(order: DriverOrder): ServiceVisual {
  const type = (order.serviceType || "").toLowerCase();
  const vendor = order.vendor && typeof order.vendor === "object" ? order.vendor : null;

  if (type === "helper") {
    return { icon: "hand-left", ...services.task, labelKey: "orders.service.helper", fallback: "Helper task" };
  }
  if (vendor || order.outlet) {
    const meat = vendor?.partnerType === "meat";
    return meat
      ? { icon: "storefront", ...services.meat, labelKey: "orders.service.meat", fallback: "Meat order" }
      : { icon: "restaurant", ...services.food, labelKey: "orders.service.food", fallback: "Food order" };
  }
  const ride = RIDE_LABELS[type];
  if (ride && !order.packageDelivery) {
    return { icon: ride.icon, ...services.ride, labelKey: `orders.service.${type}`, fallback: ride.fallback };
  }
  return { icon: "cube", ...services.delivery, labelKey: "orders.service.delivery", fallback: "Delivery" };
}

// ─── Dates ────────────────────────────────────────────────────────────────────────────────────

export function formatTime(iso?: string, locale?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString(locale || "en", { hour: "numeric", minute: "2-digit" });
}

export function formatOrderDate(iso?: string, locale?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.toLocaleDateString(locale || "en", { day: "numeric", month: "short", year: "numeric" })}, ${formatTime(iso, locale)}`;
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** "Today", "Yesterday", or "Mon, 12 Oct" for a section heading. */
export function dayHeading(
  date: Date,
  t: (key: string, options?: Record<string, unknown>) => string,
  locale?: string,
  now: Date = new Date(),
) {
  if (dayKey(date) === dayKey(now)) return t("orders.today", { defaultValue: "Today" });
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (dayKey(date) === dayKey(yesterday)) return t("orders.yesterday", { defaultValue: "Yesterday" });
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString(locale || "en", {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

export type OrderListRow =
  | { kind: "header"; key: string; date: Date }
  | { kind: "order"; key: string; order: DriverOrder };

/** The orders (newest first) with a heading row before each new day. */
export function groupByDay(orders: DriverOrder[]): OrderListRow[] {
  const rows: OrderListRow[] = [];
  let lastDay = "";
  for (const order of orders) {
    const date = new Date(order.updatedAt || order.createdAt);
    const key = dayKey(date);
    if (key !== lastDay) {
      rows.push({ kind: "header", key: `day-${key}`, date });
      lastDay = key;
    }
    rows.push({ kind: "order", key: order._id, order });
  }
  return rows;
}

export function initials(name?: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}
