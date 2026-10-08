import mongoose from "mongoose";
import AnalyticsEvent, { ANALYTICS_APPS, AnalyticsApp } from "../../database/models/AnalyticsEvent";
import { UserRole } from "../../database/models/User";
import Order, { OrderStatus } from "../../database/models/Order";
import Vendor from "../../database/models/Vendor";
import FoodItem from "../../database/models/FoodItem";
import MeatItem from "../../database/models/MeatItem";
import MeatCenter from "../../database/models/MeatCenter";

// Names the apps may send. Must stay in step with the trackEvent calls in
// app/ and driver/ — anything not listed is dropped rather than stored, so a
// typo or a stale build cannot quietly create a metric nobody looks at.
export const ALLOWED_EVENTS = new Set([
  "screen_view",
  "login",
  "sign_up",
  // customer app
  "order_placed",
  "purchase",
  "payment_failed",
  "order_cancelled",
  "button_tap",
  "select_vendor",
  "select_item",
  "add_to_cart",
  "remove_from_cart",
  "search",
  "support_opened",
  // driver app
  "go_online",
  "go_offline",
  "order_accepted",
  "order_declined",
  "order_status_updated",
  "order_completed",
  "onboarding_completed",
  "onboarding_skipped",
]);

const PLATFORMS = ["android", "ios", "web"] as const;
const MAX_PROP_KEYS = 20;
const MAX_PROP_STRING = 200;
const MAX_PROPS_BYTES = 2048;
// Events queued on a phone that was offline arrive late; anything claiming to
// be further off than this is a wrong device clock, so server time is used.
const MAX_CLOCK_SKEW_MS = 24 * 60 * 60 * 1000;
const TIMEZONE = "Asia/Kolkata";

export interface IngestCaller {
  userId?: string;
  role?: string;
}

/** Keeps only flat string/number/boolean values, size-capped. */
function sanitizeProps(raw: unknown): Record<string, string | number | boolean> | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(raw).slice(0, MAX_PROP_KEYS)) {
    if (key.length > 40 || key.startsWith("$") || key.includes(".")) continue;
    if (typeof value === "string") out[key] = value.slice(0, MAX_PROP_STRING);
    else if (typeof value === "number" && Number.isFinite(value)) out[key] = value;
    else if (typeof value === "boolean") out[key] = value;
  }
  if (Object.keys(out).length === 0) return undefined;
  return Buffer.byteLength(JSON.stringify(out)) > MAX_PROPS_BYTES ? { truncated: true } : out;
}

/**
 * Order lines of food/meat orders since `since`, grouped per item and outlet:
 * units, number of orders and revenue. Cancelled orders don't count.
 */
function orderedItemStages(since: Date, vendorId?: mongoose.Types.ObjectId): mongoose.PipelineStage[] {
  return [
    {
      $match: {
        createdAt: { $gte: since },
        vendor: vendorId ?? { $ne: null },
        status: { $nin: [OrderStatus.CANCELLED, "cancelled"] },
      },
    },
    { $unwind: "$stops" },
    // Stop items are stored as { lines: [...] } (older orders: a bare array).
    {
      $project: {
        vendor: 1,
        lines: {
          $cond: [
            { $isArray: "$stops.items" },
            "$stops.items",
            { $ifNull: ["$stops.items.lines", []] },
          ],
        },
      },
    },
    { $unwind: "$lines" },
    {
      $project: {
        vendor: 1,
        key: { $toString: { $ifNull: ["$lines.id", { $ifNull: ["$lines._id", { $ifNull: ["$lines.itemId", "$lines.name"] }] }] } },
        name: "$lines.name",
        quantity: { $max: [1, { $ifNull: [{ $toDouble: "$lines.quantity" }, 1] }] },
        price: { $ifNull: [{ $toDouble: "$lines.price" }, 0] },
      },
    },
    { $match: { key: { $nin: [null, ""] } } },
    {
      $group: {
        _id: { key: "$key", vendor: "$vendor" },
        name: { $last: "$name" },
        quantity: { $sum: "$quantity" },
        orders: { $sum: 1 },
        revenue: { $sum: { $multiply: ["$quantity", "$price"] } },
      },
    },
  ];
}

export const ITEM_SORT_KEYS = ["clicks", "cartAdds", "cartRemoves", "quantity", "orders", "revenue", "conversion", "name"] as const;
export type ItemSortKey = (typeof ITEM_SORT_KEYS)[number];

export interface ItemStatsQuery {
  days?: number;
  vendorId?: string;
  search?: string;
  sort?: ItemSortKey;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/** Signed-in users are counted once across sessions; anonymous ones by session. */
const visitorKey = { $ifNull: [{ $toString: "$user" }, "$sessionId"] };

export class AnalyticsService {
  /** Validates each event on its own and stores the good ones. Returns how many were kept. */
  async ingest(events: unknown[], caller: IngestCaller): Promise<number> {
    const now = Date.now();
    // Vendor tokens carry a Vendor id, not a User id — only attribute real users.
    const isUser = caller.role && (Object.values(UserRole) as string[]).includes(caller.role);
    const user = isUser && caller.userId && mongoose.Types.ObjectId.isValid(caller.userId)
      ? new mongoose.Types.ObjectId(caller.userId)
      : undefined;

    const docs = [];
    for (const raw of events) {
      if (!raw || typeof raw !== "object") continue;
      const e = raw as Record<string, unknown>;

      if (typeof e.name !== "string" || !ALLOWED_EVENTS.has(e.name)) continue;
      if (typeof e.app !== "string" || !(ANALYTICS_APPS as readonly string[]).includes(e.app)) continue;
      if (typeof e.sessionId !== "string" || e.sessionId.length === 0 || e.sessionId.length > 64) continue;

      const at = typeof e.at === "number" && Math.abs(now - e.at) <= MAX_CLOCK_SKEW_MS ? e.at : now;

      docs.push({
        name: e.name,
        app: e.app as AnalyticsApp,
        user,
        role: user ? caller.role : undefined,
        sessionId: e.sessionId,
        platform: (PLATFORMS as readonly unknown[]).includes(e.platform) ? e.platform : "unknown",
        appVersion: typeof e.appVersion === "string" ? e.appVersion.slice(0, 24) : undefined,
        props: sanitizeProps(e.props),
        at: new Date(at),
      });
    }

    if (docs.length > 0) {
      await AnalyticsEvent.insertMany(docs, { ordered: false });
    }
    return docs.length;
  }

  /** Everything the admin Live Activity page shows for the last `minutes`. */
  async getLiveActivity(minutes = 30) {
    const now = new Date();
    const since = new Date(now.getTime() - minutes * 60 * 1000);
    const activeNowSince = new Date(now.getTime() - 5 * 60 * 1000);
    const match = { at: { $gte: since } };

    const [perApp, activeNow, perMinute, topEvents, topScreens, recent] = await Promise.all([
      AnalyticsEvent.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$app",
            events: { $sum: 1 },
            visitors: { $addToSet: visitorKey },
            signedIn: { $addToSet: "$user" },
          },
        },
        { $project: { events: 1, activeUsers: { $size: "$visitors" }, signedInUsers: { $size: "$signedIn" } } },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { at: { $gte: activeNowSince } } },
        { $group: { _id: "$app", visitors: { $addToSet: visitorKey } } },
        { $project: { activeNow: { $size: "$visitors" } } },
      ]),
      AnalyticsEvent.aggregate([
        { $match: match },
        {
          $group: {
            _id: { app: "$app", minute: { $dateToString: { format: "%Y-%m-%dT%H:%M:00.000Z", date: "$at" } } },
            visitors: { $addToSet: visitorKey },
          },
        },
        { $project: { _id: 0, app: "$_id.app", minute: "$_id.minute", activeUsers: { $size: "$visitors" } } },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { ...match, name: { $ne: "screen_view" } } },
        { $group: { _id: { app: "$app", name: "$name" }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
        { $project: { _id: 0, app: "$_id.app", name: "$_id.name", count: 1 } },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { ...match, name: "screen_view" } },
        { $group: { _id: { app: "$app", screen: "$props.screen" }, views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 15 },
        { $project: { _id: 0, app: "$_id.app", screen: "$_id.screen", views: 1 } },
      ]),
      AnalyticsEvent.find({ at: { $gte: since } })
        .sort({ at: -1 })
        .limit(50)
        .populate("user", "name phone")
        .select("name app user role props platform appVersion at")
        .lean(),
    ]);

    const apps = Object.fromEntries(
      ANALYTICS_APPS.map((app) => {
        const totals = perApp.find((r) => r._id === app);
        const now5 = activeNow.find((r) => r._id === app);
        return [
          app,
          {
            activeNow: now5?.activeNow ?? 0,
            activeUsers: totals?.activeUsers ?? 0,
            signedInUsers: totals?.signedInUsers ?? 0,
            events: totals?.events ?? 0,
          },
        ];
      })
    );

    // Zero-filled so the chart shows quiet minutes as 0 rather than skipping them.
    const minutesSeries = [];
    const start = new Date(since);
    start.setUTCSeconds(0, 0);
    for (let t = start.getTime() + 60 * 1000; t <= now.getTime(); t += 60 * 1000) {
      const minute = new Date(t).toISOString().replace(/:\d{2}\.\d{3}Z$/, ":00.000Z");
      const row: Record<string, string | number> = { minute };
      for (const app of ANALYTICS_APPS) {
        row[app] = perMinute.find((r) => r.app === app && r.minute === minute)?.activeUsers ?? 0;
      }
      minutesSeries.push(row);
    }

    return {
      generatedAt: now.toISOString(),
      windowMinutes: minutes,
      apps,
      perMinute: minutesSeries,
      topEvents,
      topScreens,
      recent,
    };
  }

  /**
   * Food/meat items ranked two ways for the admin page:
   *  - clicked: taps on an item in a restaurant menu (select_item events)
   *  - ordered: units actually ordered, read from real orders rather than
   *    events, so it is exact and covers online and cash orders alike.
   */
  async getTopItems(days = 30, limit = 10) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [clicked, ordered] = await Promise.all([
      AnalyticsEvent.aggregate([
        { $match: { at: { $gte: since }, name: "select_item", "props.item_id": { $exists: true } } },
        {
          $group: {
            _id: "$props.item_id",
            name: { $last: "$props.item_name" },
            vendorId: { $last: "$props.vendor_id" },
            vendorName: { $last: "$props.vendor_name" },
            clicks: { $sum: 1 },
            visitors: { $addToSet: visitorKey },
          },
        },
        { $sort: { clicks: -1 } },
        { $limit: limit },
        {
          $project: {
            _id: 0, itemId: "$_id", name: 1, vendorId: 1, vendorName: 1, clicks: 1,
            uniqueUsers: { $size: "$visitors" },
          },
        },
      ]),
      Order.aggregate([
        ...orderedItemStages(since),
        { $sort: { quantity: -1 } },
        { $limit: limit },
        { $lookup: { from: Vendor.collection.name, localField: "_id.vendor", foreignField: "_id", as: "v" } },
        // Meat orders point at a meat centre rather than a restaurant.
        { $lookup: { from: MeatCenter.collection.name, localField: "_id.vendor", foreignField: "_id", as: "m" } },
        {
          $project: {
            _id: 0, itemId: "$_id.key", name: 1, quantity: 1, orders: 1, revenue: { $round: ["$revenue", 2] },
            vendorId: { $toString: "$_id.vendor" },
            vendorName: { $ifNull: [{ $arrayElemAt: ["$v.name", 0] }, { $arrayElemAt: ["$m.name", 0] }] },
          },
        },
      ]),
    ]);

    return { days, clicked, ordered };
  }

  /**
   * Every food and meat item with its numbers for the period: menu taps,
   * units added to / removed from carts, units ordered, orders and revenue,
   * and tap → order conversion. Items nobody touched are listed with zeros;
   * items no longer on a menu still appear if they had activity.
   */
  async getItemStats(query: ItemStatsQuery = {}) {
    const days = query.days ?? 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const vendorOid = query.vendorId && mongoose.Types.ObjectId.isValid(query.vendorId)
      ? new mongoose.Types.ObjectId(query.vendorId)
      : undefined;

    const [eventRows, orderRows, foodItems, meatItems, vendors, meatCenters] = await Promise.all([
      AnalyticsEvent.aggregate([
        {
          $match: {
            at: { $gte: since },
            name: { $in: ["select_item", "add_to_cart", "remove_from_cart"] },
            "props.item_id": { $exists: true },
            ...(query.vendorId ? { "props.vendor_id": query.vendorId } : {}),
          },
        },
        {
          $group: {
            _id: { $toString: "$props.item_id" },
            name: { $last: "$props.item_name" },
            vendorId: { $last: "$props.vendor_id" },
            vendorName: { $last: "$props.vendor_name" },
            clicks: { $sum: { $cond: [{ $eq: ["$name", "select_item"] }, 1, 0] } },
            cartAdds: {
              $sum: { $cond: [{ $eq: ["$name", "add_to_cart"] }, { $ifNull: [{ $toDouble: "$props.quantity" }, 1] }, 0] },
            },
            cartRemoves: {
              $sum: { $cond: [{ $eq: ["$name", "remove_from_cart"] }, { $ifNull: [{ $toDouble: "$props.quantity" }, 1] }, 0] },
            },
          },
        },
      ]),
      Order.aggregate(orderedItemStages(since, vendorOid)),
      FoodItem.find(vendorOid ? { vendorId: vendorOid } : {}).select("name price category isVeg vendorId").lean(),
      MeatItem.find(vendorOid ? { meatCenterId: vendorOid } : {}).select("name price category meatCenterId").lean(),
      Vendor.find().select("name").lean(),
      MeatCenter.find().select("name").lean(),
    ]);

    const outletName = new Map<string, string>();
    for (const v of vendors) outletName.set(String(v._id), v.name);
    for (const m of meatCenters) outletName.set(String(m._id), m.name);

    type Row = {
      itemId: string; name: string; vendorId?: string; vendorName?: string; category?: string;
      price?: number; isVeg?: boolean; type: "food" | "meat"; onMenu: boolean;
      clicks: number; cartAdds: number; cartRemoves: number; quantity: number; orders: number; revenue: number;
    };
    const rows = new Map<string, Row>();
    const blank = { clicks: 0, cartAdds: 0, cartRemoves: 0, quantity: 0, orders: 0, revenue: 0 };

    for (const f of foodItems) {
      const vendorId = String(f.vendorId);
      rows.set(String(f._id), {
        itemId: String(f._id), name: f.name, vendorId, vendorName: outletName.get(vendorId),
        category: f.category, price: f.price, isVeg: f.isVeg, type: "food", onMenu: true, ...blank,
      });
    }
    for (const m of meatItems) {
      const vendorId = String(m.meatCenterId);
      rows.set(String(m._id), {
        itemId: String(m._id), name: m.name, vendorId, vendorName: outletName.get(vendorId),
        category: m.category, price: m.price, type: "meat", onMenu: true, ...blank,
      });
    }

    const rowFor = (itemId: string, fallback: { name?: string; vendorId?: string; vendorName?: string }) => {
      let row = rows.get(itemId);
      if (!row) {
        row = {
          itemId, name: fallback.name || "(unnamed item)", vendorId: fallback.vendorId,
          vendorName: fallback.vendorName ?? (fallback.vendorId ? outletName.get(fallback.vendorId) : undefined),
          type: "food", onMenu: false, ...blank,
        };
        rows.set(itemId, row);
      }
      return row;
    };

    for (const e of eventRows) {
      const row = rowFor(e._id, { name: e.name, vendorId: e.vendorId ? String(e.vendorId) : undefined, vendorName: e.vendorName });
      row.clicks += e.clicks;
      row.cartAdds += e.cartAdds;
      row.cartRemoves += e.cartRemoves;
    }
    for (const o of orderRows) {
      const vendorId = o._id.vendor ? String(o._id.vendor) : undefined;
      const row = rowFor(o._id.key, { name: o.name, vendorId });
      row.quantity += o.quantity;
      row.orders += o.orders;
      row.revenue += o.revenue;
    }

    const search = query.search?.trim().toLowerCase();
    let list = [...rows.values()]
      .filter((r) => !query.vendorId || r.vendorId === query.vendorId)
      .filter((r) => !search || r.name.toLowerCase().includes(search) || (r.vendorName ?? "").toLowerCase().includes(search))
      .map((r) => ({
        ...r,
        revenue: Math.round(r.revenue * 100) / 100,
        // Orders per 100 menu taps. Not a strict funnel (an item can be
        // reordered without being tapped), so it can exceed 100%.
        conversion: r.clicks > 0 ? Math.round((r.orders / r.clicks) * 1000) / 10 : null,
      }));

    const totals = list.reduce(
      (t, r) => ({
        items: t.items + 1,
        clicks: t.clicks + r.clicks,
        cartAdds: t.cartAdds + r.cartAdds,
        quantity: t.quantity + r.quantity,
        orders: t.orders + r.orders,
        revenue: Math.round((t.revenue + r.revenue) * 100) / 100,
      }),
      { items: 0, clicks: 0, cartAdds: 0, quantity: 0, orders: 0, revenue: 0 },
    );

    const sort = query.sort ?? "quantity";
    const dir = query.order === "asc" ? 1 : -1;
    list.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name) * dir;
      const av = (a[sort] ?? -1) as number;
      const bv = (b[sort] ?? -1) as number;
      return (av - bv) * dir || b.clicks - a.clicks || a.name.localeCompare(b.name);
    });

    const limit = query.limit ?? 50;
    const page = Math.max(1, query.page ?? 1);
    const total = list.length;
    list = list.slice((page - 1) * limit, page * limit);

    // Every restaurant and meat centre, so the filter keeps its full list
    // while one of them is selected.
    const outlets = [...outletName.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return { days, sort, order: dir === 1 ? "asc" : "desc", page, limit, total, totals, outlets, items: list };
  }

  /** Daily active users and event counts per app, for the trend chart. */
  async getSummary(days = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const rows = await AnalyticsEvent.aggregate([
      { $match: { at: { $gte: since } } },
      {
        $group: {
          _id: { app: "$app", day: { $dateToString: { format: "%Y-%m-%d", date: "$at", timezone: TIMEZONE } } },
          events: { $sum: 1 },
          visitors: { $addToSet: visitorKey },
        },
      },
      { $project: { _id: 0, app: "$_id.app", day: "$_id.day", events: 1, activeUsers: { $size: "$visitors" } } },
      { $sort: { day: 1 } },
    ]);

    const byDay = new Map<string, Record<string, string | number>>();
    for (const r of rows) {
      const entry: Record<string, string | number> = byDay.get(r.day) ?? { day: r.day };
      entry[`${r.app}Users`] = r.activeUsers;
      entry[`${r.app}Events`] = r.events;
      byDay.set(r.day, entry);
    }
    return { days, daily: [...byDay.values()] };
  }
}
