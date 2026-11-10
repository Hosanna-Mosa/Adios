import i18n from "@/i18n";
import { STATUS_RANK, buildStepper, cardTitle, serviceIcon, type Stepper } from "@/components/shared/orderProgress";

export { cardTitle, serviceIcon, type Stepper };

const RIDE_KEYS = ["bike", "auto", "cab", "cab_prime"];

export interface LiveSteps {
  labels: string[];
  done: boolean[];
  /** Index of the step in progress: the first one not yet done. */
  current: number;
}

/**
 * The live order's checklist, with the same steps and the same "done" rules as the
 * tracking screen's timeline (app/tracking.tsx buildTimeline), so the card and the
 * screen it opens never disagree about where the order is.
 */
export function liveSteps(order: any, serviceKey: string): LiveSteps {
  const rank = STATUS_RANK[String(order?.status || "").toUpperCase()] ?? 0;
  const t = (key: string) => i18n.t(`app.tracking.${key}`);
  let labels: string[];
  let done: boolean[];
  if (RIDE_KEYS.includes(serviceKey)) {
    labels = [t("rideLabels.captainAssigned"), t("rideLabels.headingToPickup"), t("rideLabels.tripInProgress"), t("rideLabels.tripCompleted")];
    done = [rank >= 1, rank >= 2, rank >= 4, false];
  } else if (serviceKey === "helper") {
    labels = [t("helperLabels.helperAssigned"), t("helperLabels.taskInProgress"), t("helperLabels.taskCompleted")];
    done = [rank >= 1, rank >= 3, false];
  } else {
    labels = [t("deliveryLabels.orderPlaced"), t("deliveryLabels.prepared"), t("deliveryLabels.outForDelivery"), t("deliveryLabels.delivered")];
    done = [true, rank >= 3, rank >= 4, false];
  }
  return { labels, done, current: done.indexOf(false) };
}

/** Total quantity of items on a food / meat order, or 0 when it has none. */
export function itemCount(order: any): number {
  const lines = Array.isArray(order?.items) ? order.items : [];
  return lines.reduce((sum: number, line: any) => sum + (Number(line?.quantity) || 1), 0);
}

/** Where the order is headed: the drop for deliveries and rides, the task spot for helpers. */
export function destination(order: any, serviceKey: string): string {
  const stops = (order?.stops || []).filter((s: any) => s?.address);
  if (!stops.length) return "";
  return serviceKey === "helper" ? stops[0].address : stops[stops.length - 1].address;
}

/** The outlet name for food / meat orders: the populated vendor, else the pickup stop. */
export function outletName(order: any): string {
  if (order?.vendor && typeof order.vendor === "object" && order.vendor.name) return order.vendor.name;
  return order?.stops?.[0]?.address || i18n.t("app.orders.orderFallback", "Order");
}

/** "2:28 PM" style time, or "" when the value isn't a date. */
export function clockTime(value: any): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/** Restaurant name, or the route for rides / courier orders. */
export function orderTitle(order: any): string {
  if (order?.vendor && typeof order.vendor === "object" && order.vendor.name) return order.vendor.name;
  const route = (order?.stops || []).map((s: any) => s?.address).filter(Boolean).join(" → ");
  return route || i18n.t("app.orders.orderFallback", "Order");
}

/** "12 Mar" style date for list rows, or "" when the order has none. */
export function shortDate(value: any): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString([], { day: "numeric", month: "short" });
}

// ---------------------------------------------------------------------------
// My Orders card content (title, detail lines, stepper, grouping, search).
// ---------------------------------------------------------------------------


function stopLines(order: any): any[] {
  const stops = Array.isArray(order?.stops) ? order.stops : [];
  return stops.flatMap((s: any) => (Array.isArray(s?.items) ? s.items : Array.isArray(s?.items?.lines) ? s.items.lines : []));
}

/** "Biryani x1 | Raita x1" for outlet orders; "Documents x1" for parcels. "" when there is nothing to list. */
export function itemsLine(order: any, serviceKey: string): string {
  const flat = Array.isArray(order?.items) && order.items.length ? order.items : stopLines(order);
  const lines = flat
    .map((l: any) => {
      const name = String(l?.name || "").trim();
      if (!name) return "";
      const qty = Math.max(1, Math.round(Number(l?.quantity) || 1));
      const unit = l?.unit || l?.weight ? ` (${l.unit || l.weight})` : "";
      return `${name} x${qty}${unit}`;
    })
    .filter(Boolean);
  if (lines.length) return lines.slice(0, 3).join("  |  ") + (lines.length > 3 ? ` +${lines.length - 3}` : "");
  if (serviceKey === "packageDelivery") return i18n.t("app.orders.parcelFallback", "Parcel x1");
  return "";
}

/** Helper task name, e.g. "Home Cleaning". */
export function helperTaskName(order: any): string {
  const stop = order?.stops?.[0];
  const lines = Array.isArray(stop?.items?.lines) ? stop.items.lines : [];
  return String(lines[0]?.name || stop?.items?.title || stop?.items?.category || stop?.storeName || i18n.t("app.orders.helperFallback", "Helper task"));
}

/** Vehicle word for ride cards: Bike / Auto / Car. */
export function vehicleLabel(serviceKey: string): string {
  if (serviceKey === "bike") return i18n.t("app.orders.vehicle.bike", "Bike");
  if (serviceKey === "auto") return i18n.t("app.orders.vehicle.auto", "Auto");
  return i18n.t("app.orders.vehicle.car", "Car");
}

export function fromAddress(order: any): string {
  return order?.stops?.find((s: any) => s?.address)?.address || "";
}

export function toAddress(order: any): string {
  const stops = (order?.stops || []).filter((s: any) => s?.address);
  return stops.length > 1 ? stops[stops.length - 1].address : "";
}

/** "Today, 8:24 PM" / "Yesterday, 7:10 PM" / "25 Oct, 6:40 PM". */
export function whenLabel(value: any): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const time = clockTime(value);
  const day = dayGroupLabel(value);
  return day === dayGroupLabel(new Date()) || day === i18n.t("app.orders.yesterday", "Yesterday")
    ? `${day}, ${time}`
    : `${d.toLocaleDateString([], { day: "numeric", month: "short" })}, ${time}`;
}

/** Past-list group heading: "Today", "Yesterday", else "25 Oct 2026". */
export function dayGroupLabel(value: any): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOf(new Date()) - startOf(d)) / 86400000);
  if (diff === 0) return i18n.t("app.orders.today", "Today");
  if (diff === 1) return i18n.t("app.orders.yesterday", "Yesterday");
  return d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
}

/** The live card's stepper, from the order as the list API returns it. */
export function stepper(order: any, serviceKey: string): Stepper {
  const waiting = order?.dispatchMode === "broadcast" && String(order?.status || "").toUpperCase() === "CREATED" && !order?.restaurantAcceptedAt;
  return buildStepper(serviceKey, order?.status, waiting);
}

/** Free-text search across outlet, items, addresses and service name. */
export function matchesQuery(order: any, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [
    typeof order?.vendor === "object" ? order.vendor?.name : "",
    cardTitle(order?.__serviceKey),
    itemsLine(order, order?.__serviceKey),
    fromAddress(order),
    toAddress(order),
    order?.totalPrice != null ? String(Math.round(order.totalPrice)) : "",
  ];
  return hay.join(" ").toLowerCase().includes(q);
}
